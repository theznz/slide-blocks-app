package com.theznz.slideblocks;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // app-local plugin: vibrations that ignore the phone's touch-feedback switch (see GameHapticsPlugin)
        registerPlugin(GameHapticsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
