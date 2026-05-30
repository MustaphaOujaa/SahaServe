<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeliveryWorkerStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(public User $worker)
    {
    }

    public function broadcastOn(): Channel
    {
        return new Channel('orders');
    }

    public function broadcastAs(): string
    {
        return 'delivery.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'worker' => [
                'id' => $this->worker->id,
                'name' => $this->worker->name,
                'phone_number' => $this->worker->phone_number,
                'delivery_status' => $this->worker->delivery_status,
            ],
        ];
    }
}
