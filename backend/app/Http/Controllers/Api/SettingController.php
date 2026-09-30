<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = Setting::first();

        if (! $settings) {
            $settings = Setting::create([
                'company_name' => 'NexaERP',
                'invoice_prefix' => 'INV-',
                'currency' => 'INR',
                'currency_symbol' => '₹',
                'date_format' => 'DD-MM-YYYY',
                'timezone' => 'Asia/Kolkata',
                'default_low_stock_threshold' => 5,
                'app_name' => 'NexaERP',
            ]);
        }

        return response()->json([
            'message' => 'Settings retrieved successfully.',
            'data' => $settings,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => ['sometimes', 'required', 'string', 'max:150'],
            'logo' => ['sometimes', 'nullable', 'string', 'max:1000'],

            'email' => ['sometimes', 'nullable', 'email', 'max:150'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],

            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'state' => ['sometimes', 'nullable', 'string', 'max:100'],
            'pincode' => ['sometimes', 'nullable', 'string', 'max:20'],

            'gst_number' => ['sometimes', 'nullable', 'string', 'max:30'],
            'website' => ['sometimes', 'nullable', 'string', 'max:255'],

            'invoice_prefix' => ['sometimes', 'required', 'string', 'max:20'],
            'invoice_footer' => ['sometimes', 'nullable', 'string', 'max:500'],

            'currency' => ['sometimes', 'required', 'string', 'max:10'],
            'currency_symbol' => ['sometimes', 'required', 'string', 'max:10'],

            'date_format' => ['sometimes', 'required', 'string', 'max:30'],
            'timezone' => ['sometimes', 'required', 'string', 'max:100'],

            'default_low_stock_threshold' => [
                'sometimes',
                'required',
                'integer',
                'min:0',
            ],

            'app_name' => ['sometimes', 'required', 'string', 'max:100'],
            'app_logo' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        $settings = Setting::first();

        if (! $settings) {
            $settings = Setting::create($validated);
        } else {
            $settings->update($validated);
        }

        return response()->json([
            'message' => 'Settings updated successfully.',
            'data' => $settings->fresh(),
        ]);
    }
}