package com.theznz.slideblocks;

import android.content.Context;
import android.media.AudioAttributes;
import android.os.VibrationAttributes;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

/**
 * Game haptics for Android.
 *
 * The stock Haptics plugin (and Chrome's navigator.vibrate) tag every buzz as a TOUCH
 * vibration, and Android also files untagged short buzzes under TOUCH, so they are dropped
 * whenever the phone's "touch feedback" vibration is off or at zero (common on Samsung) and the
 * player feels nothing even with the in-game switch on. These are tagged as MEDIA (game)
 * vibrations instead, which follow the phone's media vibration setting; the in-game
 * "Titreşim" switch stays the way to turn them off.
 */
@CapacitorPlugin(name = "GameHaptics")
public class GameHapticsPlugin extends Plugin {

    private Vibrator vibrator() {
        Context ctx = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vm = (VibratorManager) ctx.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            return vm != null ? vm.getDefaultVibrator() : null;
        }
        return (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
    }

    /** pattern: [on, off, on, ...] in milliseconds, like navigator.vibrate. */
    @PluginMethod
    public void vibrate(PluginCall call) {
        Vibrator v = vibrator();
        if (v == null || !v.hasVibrator()) {
            call.resolve();
            return;
        }
        JSArray arr = call.getArray("pattern");
        long[] timings;
        try {
            int n = arr == null ? 0 : arr.length();
            if (n == 0) {
                timings = new long[] { 0, call.getInt("duration", 30) };
            } else {
                // Android patterns start with an initial delay
                timings = new long[n + 1];
                timings[0] = 0;
                for (int i = 0; i < n; i++) timings[i + 1] = Math.max(0, arr.getLong(i));
            }
        } catch (JSONException e) {
            call.reject("bad pattern");
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            VibrationEffect effect = timings.length == 2
                ? VibrationEffect.createOneShot(timings[1], VibrationEffect.DEFAULT_AMPLITUDE)
                : VibrationEffect.createWaveform(timings, -1);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                v.vibrate(effect, VibrationAttributes.createForUsage(VibrationAttributes.USAGE_MEDIA));
            } else {
                v.vibrate(effect, new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).build());
            }
        } else {
            v.vibrate(timings, -1);
        }
        call.resolve();
    }
}
