<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use App\Models\EmailOtp;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    //register using google account
    public function handleGoogleCallback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::where('email', $googleUser->email)->first();

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->name,
                'email' => $googleUser->email,
                'password' => bcrypt(uniqid()),
            ]);
        }

        $user->assignRole('client');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }
    //first step : send otp
    public function sendOtp(Request $request)
    {
        $request->validate([
            'name' => 'required|string|min:3',
            'email' => 'required|email',
            'adress' => 'required|max:255',
            'phone_number' => 'required|digits:10'
        ]);
        $otp = rand(100000, 999999);

        EmailOtp::updateOrCreate(
            ['email' => $request->email],
            [
                'otp' => $otp,
                'expires_at' => now()->addMinutes(10)
            ]
        );

        Mail::send([], [], function ($message) use ($request, $otp) {
            $message->from(config('mail.from.address'), config('mail.from.name'));
            $message->to($request->email);
            $message->subject('SahaServe Verification Code');
            $message->html("<strong>Your OTP code is: $otp</strong>");
        });

        return response()->json([
            'message' => 'OTP sent successfully via SMTP'
        ]);
    }
    //second step : register by verification
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'adress' => 'required|string',
            'phone_number' => 'required|string',
            'password' => 'required',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'otp' => 'required'
        ]);

        $otpRecord = EmailOtp::where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        if (!$otpRecord) {
            return response()->json([
                'status' => "false",
                'message' => 'Invalid OTP'
            ], 400);
        }

        if ($otpRecord->expires_at < now()) {
            return response()->json([
                'message' => 'OTP expired'
            ], 400);
        }

        // image upload logic
        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('users', 'public');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'adress' => $request->adress,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'image' => $imagePath,
            'email_verified_at' => now()
        ]);

        $otpRecord->delete();

        $user->assignRole('client');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }
    // Login
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6'
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json([
                "status" => "false",
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            "status" => "success",
            'user' => $user,
            'token' => $token,
            'message' => 'logged in'
        ]);
    }
    //Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
    //delete account 
    public function deleteAccount(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'password' => 'required'
        ]);

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Password incorrect'
            ], 403);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Account deleted successfully'
        ]);
    }
    // update account info
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'adress' => 'sometimes|string',
            'phone_number' => 'sometimes|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        $data = [
            'name' => $request->name ?? $user->name,
            'email' => $request->email ?? $user->email,
            'adress' => $request->adress ?? $user->adress,
            'phone_number' => $request->phone_number ?? $user->phone_number,
        ];

        if ($request->hasFile('image')) {

            if ($user->image) {
                Storage::disk('public')->delete($user->image);
            }

            $data['image'] = $request->file('image')
                ->store('users', 'public');
        }

        $user->update($data);
        $user->refresh();
        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }
    //forgot password
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $isIn = User::where('email', $request->email)->first();

        if (!$isIn) {
            return response()->json([
                "status" => "false",
                "message" => "no user with this email"
            ]);
        }

        $otp = rand(100000, 999999);

        EmailOtp::updateOrCreate(
            ['email' => $request->email],
            [
                'otp' => $otp,
                'expires_at' => now()->addMinutes(10)
            ]
        );

        Mail::send([], [], function ($message) use ($request, $otp) {
            $message->from(config('mail.from.address'), config('mail.from.name'));
            $message->to($request->email);
            $message->subject('SahaServe Verification Code');
            $message->html("<strong>Your reset password code is: $otp</strong>");
        });

        return response()->json([
            "status" => "success",
            "message" => "OTP sent successfully"
        ]);

    }
    //reset password
    public function resetPassword(Request $request)
    {
        $request->validate([
            "newPassword" => "required|min:6",
            "email" => "email|required",
            "otp" => "required"
        ]);

        $otpRecord = EmailOtp::where("email", $request->email)
            ->where("otp", $request->otp)
            ->first();

        if (!$otpRecord) {
            return response()->json([
                'status' => 'false',
                'message' => 'Invalid OTP'
            ], 400);
        }

        if ($otpRecord->expires_at < now()) {
            return response()->json([
                'status' => "false",
                'message' => 'OTP expired'
            ], 400);
        }

        $user = User::where("email", $request->email)->first();

        $user->update([
            "password" => Hash::make($request->newPassword)
        ]);

        return response()->json([
            'status' => "success",
            'message' => "password updated go login!"
        ]);
    }
}
