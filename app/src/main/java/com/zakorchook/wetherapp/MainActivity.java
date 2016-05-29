package com.zakorchook.wetherapp;


import android.os.Bundle;
import android.support.v4.app.FragmentManager;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.preference.PreferenceManager;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ProgressBar;

import com.zakorchook.wetherapp.bus.ActionProgressBar;
import com.zakorchook.wetherapp.dialogs.ErrorDialog;
import com.zakorchook.wetherapp.fragments.PrefsFragment;
import com.zakorchook.wetherapp.fragments.WeatherFragment;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.util.ErrorDialogFragments;

public class MainActivity extends AppCompatActivity implements PrefsFragment.OnFragmentInteractionListener {

    private static final String TAG = MainActivity.class.getSimpleName();
    private static final String CITY_KEY = "CITY_KEY";
    private Toolbar toolbar;
    private FragmentManager fragmentManager;
    private ProgressBar progressBar;
    private String currentCity;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        fragmentManager = getSupportFragmentManager();
        progressBar = (ProgressBar) findViewById(R.id.progressBar);
        toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        currentCity = PreferenceManager.getDefaultSharedPreferences(this).getString(CITY_KEY, "Kiev");
        fragmentManager.beginTransaction().add(R.id.container, WeatherFragment.newInstance(currentCity)).commit();
        EventBus.getDefault().register(this);
        Log.d(TAG, "onCreate: ");
    }

    @Override
    protected void onDestroy() {
        Log.d(TAG, "onDestroy: ");
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
                    .replace(R.id.container, PrefsFragment.newInstance(currentCity))
                    .addToBackStack(null)
                    .commit();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Subscribe
    public void onEvent(final ActionProgressBar event){
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Log.d(TAG, "run: ActionProgressBar "+event.show);
                if (event.show){
                    progressBar.setVisibility(View.VISIBLE);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
                if (event.isFail){
                    ErrorDialog.newInstance().show(fragmentManager, null);
                }
            }
        });
    }

    @Override
    public void onFragmentInteraction(boolean hideMenu) {
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
    }
}
