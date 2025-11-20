<?php

namespace App\Http\Controllers;

use App\Models\OgpCache;
use Illuminate\Http\Request;
use Shweshi\OpenGraph\OpenGraph;

class OgpController extends Controller
{
    public function preview(Request $request, OpenGraph $og)
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $url = $request->input('url');

        // Check cache
        $cached = OgpCache::where('url', $url)->first();
        if ($cached && $cached->updated_at->diffInDays(now()) < 7) {
            return response()->json($cached);
        }

        try {
            $data = $og->fetch($url, true);
            
            $ogp = OgpCache::updateOrCreate(
                ['url' => $url],
                [
                    'title' => $data['title'] ?? null,
                    'description' => $data['description'] ?? null,
                    'image' => $data['image'] ?? null,
                    'site_name' => $data['site_name'] ?? null,
                ]
            );

            return response()->json($ogp);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch OGP: ' . $e->getMessage()], 422);
        }
    }
}
