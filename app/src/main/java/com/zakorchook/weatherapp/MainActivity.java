package com.zakorchook.weatherapp;


import android.os.Bundle;
import android.os.Handler;
import android.support.v4.app.FragmentManager;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.preference.PreferenceManager;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ProgressBar;

import com.zakorchook.weatherapp.bus.ActionProgressBar;
import com.zakorchook.weatherapp.dialogs.ErrorDialog;
import com.zakorchook.weatherapp.fragments.PrefsFragment;
import com.zakorchook.weatherapp.fragments.WeatherFragment;
import com.zakorchook.weatherapp.models.WeatherData;
import com.zakorchook.weatherapp.util.MyConstants;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

import java.util.Locale;

public class MainActivity extends AppCompatActivity implements PrefsFragment.OnFragmentInteractionListener {

    private static final String TAG = MainActivity.class.getSimpleName();
    private static final String CITY_KEY = "CITY_KEY";

    private static final int HALF_HOUR = 30 * 60 * 1000;

    private Toolbar toolbar;
    private FragmentManager fragmentManager;
    private ProgressBar progressBar;
    private String currentCity;
    private Handler handler;
    private boolean lastRequestIsFailed;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        EventBus.getDefault().register(this);
        fragmentManager = getSupportFragmentManager();
        progressBar = (ProgressBar) findViewById(R.id.progressBar);
        toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        currentCity = PreferenceManager.getDefaultSharedPreferences(this).getString(CITY_KEY, MyConstants.KIEV);
        fragmentManager.beginTransaction().add(R.id.container, WeatherFragment.newInstance(currentCity)).commit();
        Log.d(TAG, "onCreate: " + Locale.getDefault().getCountry());
    }

    @Override
    protected void onDestroy() {
        Log.d(TAG, "onDestroy: ");
        if (handler != null) {
            handler.removeCallbacksAndMessages(null);
            handler = null;
        }
        EventBus.getDefault().unregister(this);
        RestClient.getInstance().close();
        super.onDestroy();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.action_settings) {
            Log.d(TAG, "onOptionsItemSelected: action_settings");
            fragmentManager.beginTransaction()
                    .replace(R.id.container, PrefsFragment.newInstance(currentCity, lastRequestIsFailed))
                    .addToBackStack(null)
                    .commit();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    /**
     * Show/hide progressBar,and show error dialog, if needed.
     */
    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onEvent(final ActionProgressBar event) {
        Log.d(TAG, "run: ActionProgressBar " + event.show);
        if (event.show) {
            progressBar.setVisibility(View.VISIBLE);
        } else {
            progressBar.setVisibility(View.GONE);
        }
        if (event.isFail) {
            ErrorDialog.newInstance(currentCity).show(fragmentManager, null);
            lastRequestIsFailed = true;
        } else {
            lastRequestIsFailed = false;
        }
    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onEvent(final WeatherData event) {
        setTimerForRefreshData(event.city);
    }

    /**
     * Hide settings icon when PrefsFragment is showing
     */
    @Override
    public void onFragmentPrefsResume(boolean hideMenu) {
        toolbar.getMenu().getItem(0).setVisible(!hideMenu);
        if (hideMenu) {
            toolbar.setTitle(R.string.settings_title);
        } else {
            toolbar.setTitle(R.string.app_name);
        }
    }

    @Override
    public void onCurrentCityChanged(String currentCity) {
        this.currentCity = currentCity;
        PreferenceManager.getDefaultSharedPreferences(this).edit().putString(CITY_KEY, currentCity).apply();
    }

    /**
     * set 30min delayed for repeat request and refresh data
     */
    private void setTimerForRefreshData(final String currentCity) {
        Log.d(TAG, "setTimerForRefreshData: ");
        if (handler == null) {
            handler = new Handler();
        } else {
            handler.removeCallbacksAndMessages(null);
        }
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                Log.d(TAG, "setTimerForRefreshData run:");
                RestClient.getInstance().getDataByCity(currentCity, Locale.getDefault().getLanguage());
            }
        }, HALF_HOUR);
    }
}
