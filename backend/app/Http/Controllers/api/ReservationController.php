<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReservationController extends Controller
{
    /**
     * Display a listing of the reservations for the authenticated user.
     */
    public function getUserReservations(Request $request)
    {
        $user = $request->user();
        $reservations = Reservation::with('table')->where('user_id', $user->id)->get();

        return response()->json([
            'status' => 'success',
            'data' => $reservations
        ]);
    }

    /**
     * Display a listing of all reservations (Admin only).
     */
    public function getAllReservations()
    {
        $reservations = Reservation::with(['user', 'table'])->get();

        return response()->json([
            'status' => 'success',
            'data' => $reservations
        ]);
    }

    /**
     * Store a newly created reservation in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'table_id' => 'required|exists:tables,id',
            'reservation_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $table = Table::find($request->table_id);
        if (!$table->is_available) {
            return response()->json([
                'status' => 'error',
                'message' => 'This table is currently not available for reservation.'
            ], 400);
        }

        $overlap = Reservation::where('table_id', $request->table_id)
            ->where('reservation_date', $request->reservation_date)
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                    ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('start_time', '<=', $request->start_time)
                            ->where('end_time', '>=', $request->end_time);
                    });
            })
            ->where('status', '!=', 'cancelled')
            ->exists();

        if ($overlap) {
            return response()->json([
                'status' => 'error',
                'message' => 'Table is already reserved for this time slot.'
            ], 400);
        }

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'table_id' => $request->table_id,
            'reservation_date' => $request->reservation_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Reservation created successfully',
            'data' => $reservation->load('table')
        ], 201);
    }

    /**
     * Display the specified reservation.
     */
    // public function show(Request $request, $id)
    // {
    //     $reservation = Reservation::with(['user', 'table'])->find($id);

    //     if (!$reservation) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Reservation not found'
    //         ], 404);
    //     }

    //     return response()->json([
    //         'status' => 'success',
    //         'data' => $reservation
    //     ]);
    // }

    /**
     * Update the specified reservation in storage.
     */
    public function update(Request $request, $id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Reservation not found'
            ], 404);
        }

        $rules = [
            'status' => 'sometimes|in:pending,confirmed,cancelled,completed,no_show',
            'reservation_date' => 'sometimes|date|after_or_equal:today',
            'start_time' => 'sometimes',
            'end_time' => 'sometimes|after:start_time',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }



        $reservation->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Reservation updated successfully',
            'data' => $reservation
        ]);
    }

    /**
     * Remove the specified reservation from storage.
     */
    public function destroy(Request $request, $id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Reservation not found'
            ], 404);
        }

        $reservation->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Reservation deleted successfully'
        ]);
    }
}