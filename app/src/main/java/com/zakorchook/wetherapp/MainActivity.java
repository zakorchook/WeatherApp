package com.zakorchook.wetherapp;


import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.FragmentManager;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.ProgressBar;

import com.zakorchook.wetherapp.fragments.PrefsFragment;
import com.zakorchook.wetherapp.fragments.WeatherFragment;

public class MainActivity extends AppCompatActivity implements WeatherFragment.OnFragmentInteractionListener, PrefsFragment.OnFragmentInteractionListener {

    private static final String TAG = MainActivity.class.getSimpleName();
    private Toolbar toolbar;
    private FragmentManager fragmentManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        fragmentManager = getSupportFragmentManager();
        toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        fragmentManager.beginTransaction().add(R.id.container, WeatherFragment.newInstance(null, null)).commit();
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
                    .replace(R.id.container, PrefsFragment.newInstance(null, null))
                    .addToBackStack(null)
                    .commit();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onFragmentInteraction(Uri uri) {
        toolbar.getMenu().clear();
    }

    @Override
    public void onFragmentInteraction(boolean hideMenu) {
        toolbar.getMenu().getItem(0).setVisible(!hideMenu);
        if(hideMenu){
            toolbar.setTitle("Настройки");
        } else {
            toolbar.setTitle(R.string.app_name);
        }
    }
}
