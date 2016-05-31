package com.zakorchook.weatherapp.fragments;

import android.content.Context;
import android.os.Bundle;
import android.support.v7.preference.Preference;
import android.support.v7.preference.PreferenceFragmentCompat;
import android.util.Log;

import com.zakorchook.weatherapp.R;
import com.zakorchook.weatherapp.RestClient;
import com.zakorchook.weatherapp.util.MyConstants;

import java.util.Locale;


public class PrefsFragment extends PreferenceFragmentCompat {

    private static final String TAG = PrefsFragment.class.getSimpleName();
    private static final String KEY_CITY = "KEY_CITY";
    private static final String KEY_2 = "lastRequestIsFailed";

    private String currentCity;
    private boolean lastRequestIsFailed;

    private OnFragmentInteractionListener mListener;

    public PrefsFragment() {
        // Required empty public constructor
    }

    public static PrefsFragment newInstance(final String CURRENT_CITY, boolean lastRequestIsFailed) {
        PrefsFragment fragment = new PrefsFragment();
        Bundle args = new Bundle();
        args.putString(KEY_CITY, CURRENT_CITY);
        args.putBoolean(KEY_2, lastRequestIsFailed);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            currentCity = getArguments().getString(KEY_CITY, MyConstants.KIEV);
            lastRequestIsFailed = getArguments().getBoolean(KEY_2, false);
        }
    }

    @Override
    public void onCreatePreferences(Bundle bundle, String s) {
        addPreferencesFromResource(R.xml.preferences);
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        if (context instanceof OnFragmentInteractionListener) {
            mListener = (OnFragmentInteractionListener) context;
        } else {
            throw new RuntimeException(context.toString()
                    + " must implement OnFragmentInteractionListener");
        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
        mListener = null;
    }

    @Override
    public void onResume() {
        super.onResume();
        mListener.onFragmentPrefsResume(true);
    }

    @Override
    public void onPause() {
        mListener.onFragmentPrefsResume(false);
        super.onPause();
    }

    @Override
    public boolean onPreferenceTreeClick(Preference preference) {
        final String KEY = preference.getKey();
        Log.d(TAG, "onPreferenceTreeClick: " + KEY);
        // If city changed or last request is failed - make new request to server. Else - not needed.
        if (!KEY.equals(currentCity) || lastRequestIsFailed) {
            mListener.onCurrentCityChanged(KEY);
            RestClient.getInstance().getDataByCity(KEY, Locale.getDefault().getLanguage());
        }
        getFragmentManager().popBackStack();
        return super.onPreferenceTreeClick(preference);
    }

    public interface OnFragmentInteractionListener {
        void onFragmentPrefsResume(boolean hideMenu);

        void onCurrentCityChanged(String currentCity);
    }
}
