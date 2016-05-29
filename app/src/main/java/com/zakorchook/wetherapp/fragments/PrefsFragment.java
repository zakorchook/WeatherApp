package com.zakorchook.wetherapp.fragments;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v7.preference.Preference;
import android.support.v7.preference.PreferenceFragmentCompat;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.zakorchook.wetherapp.R;
import com.zakorchook.wetherapp.RestClient;

import java.util.Locale;


public class PrefsFragment extends PreferenceFragmentCompat implements Preference.OnPreferenceClickListener {

    private static final String KEY_CITY = "KEY_CITY";
    private static final String TAG = PrefsFragment.class.getSimpleName();

    private String currentCity;

    private OnFragmentInteractionListener mListener;
    private View v;

    public PrefsFragment() {
        // Required empty public constructor
    }

    public static PrefsFragment newInstance(final String CURRENT_CITY) {
        PrefsFragment fragment = new PrefsFragment();
        Bundle args = new Bundle();
        args.putString(KEY_CITY, CURRENT_CITY);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            currentCity = getArguments().getString(KEY_CITY);
        }
//        setRetainInstance(true);
    }

//    @Override
//    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
//        if (v == null)
//            v = super.onCreateView(inflater, container, savedInstanceState);
//        return v;
//    }

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
        mListener.onFragmentInteraction(true);
    }

    @Override
    public void onPause() {
        mListener.onFragmentInteraction(false);
        super.onPause();
    }

    @Override
    public boolean onPreferenceClick(Preference preference) {
        final String KEY = preference.getKey();
        Log.d(TAG, "onPreferenceClick: " + KEY);
        if (!KEY.equals(currentCity)) {
            RestClient.getInstance().getDataBySity(KEY, Locale.getDefault().getLanguage());
        }
        getFragmentManager().popBackStack();
        return false;
    }

    @Override
    public boolean onPreferenceTreeClick(Preference preference) {
        final String KEY = preference.getKey();
        Log.d(TAG, "onPreferenceTreeClick: " + KEY);
        if (!KEY.equals(currentCity)) {
            mListener.onCurrentCityChanged(KEY);
            RestClient.getInstance().getDataBySity(KEY, Locale.getDefault().getLanguage());
        }
        getFragmentManager().popBackStack();
        return super.onPreferenceTreeClick(preference);
    }

    public interface OnFragmentInteractionListener {
        void onFragmentInteraction(boolean hideMenu);

        void onCurrentCityChanged(String currentCity);
    }
}
