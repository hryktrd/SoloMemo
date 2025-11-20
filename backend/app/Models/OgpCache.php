<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OgpCache extends Model
    protected $fillable = ['url', 'title', 'description', 'image', 'site_name'];
}
