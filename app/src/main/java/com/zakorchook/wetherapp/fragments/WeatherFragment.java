package com.zakorchook.wetherapp.fragments;

import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.zakorchook.wetherapp.R;
import com.zakorchook.wetherapp.RestClient;
import com.zakorchook.wetherapp.models.WeatherData;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;

import java.util.Locale;


public class WeatherFragment extends Fragment {

    private static final String ARG_CITY = "ARG_CITY";

    private static final String BASE_ICON_URL = "http://openweathermap.org/img/w/";
    private static final String ICON_FORMAT = ".png";
    private static final String TAG = WeatherFragment.class.getSimpleName();

    private TextView textView1;
    private TextView textView2;
    private TextView textView3;
    private TextView textView4;
    private TextView textView5;

    private ImageView imageView;

    private String currentCity;

    private View v;

    public WeatherFragment() {
        // Required empty public constructor
    }

    public static WeatherFragment newInstance(String currentCity) {
        WeatherFragment fragment = new WeatherFragment();
        Bundle args = new Bundle();
        args.putString(ARG_CITY, currentCity);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            currentCity = getArguments().getString(ARG_CITY);
        }
        EventBus.getDefault().register(this);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        if (v == null) {
            v = inflater.inflate(R.layout.fragment_weather, container, false);
            initViews(v);
            RestClient.getInstance().getDataBySity(currentCity, Locale.getDefault().getLanguage());
        }
        return v;
    }

    @Override
    public void onDestroy() {
        EventBus.getDefault().unregister(this);
        super.onDestroy();
    }

    private void initViews(View v) {
        imageView = (ImageView) v.findViewById(R.id.image);
        textView1 = (TextView) v.findViewById(R.id.textCity);
        textView2 = (TextView) v.findViewById(R.id.textTemp);
        textView3 = (TextView) v.findViewById(R.id.textTempMin);
        textView4 = (TextView) v.findViewById(R.id.textTempMax);
        textView5 = (TextView) v.findViewById(R.id.description);
    }

    private String fromKelvinToCelsi(double kelvin) {
        final int ABS_NULL = 273;
        final String DEGREE = (char) 0x00B0+"C";
        if (kelvin > ABS_NULL)
            return "+" + (int) Math.round(kelvin - ABS_NULL) +DEGREE;
        else
            return (int) Math.round(kelvin - ABS_NULL) + DEGREE;
    }

    @Subscribe
    public void onEvent(final WeatherData event) {
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                currentCity = event.city;
                Glide.with(WeatherFragment.this).load(BASE_ICON_URL + event.icon + ICON_FORMAT).into(imageView);
                textView1.setText(getCityTitle(event.city));
                Log.d(TAG, "run: imageView h " + imageView.getHeight()+" "+pxToDp(imageView.getHeight()));
                textView2.setTextSize(pxToDp(imageView.getHeight())/2);
                textView2.setText(fromKelvinToCelsi(event.temp));
                textView3.setText(fromKelvinToCelsi(event.temp_min));
                textView4.setText(fromKelvinToCelsi(event.temp_max));
                textView5.setText(event.description);
            }
        });
    }

    private String getCityTitle(String city) {
        final String CITY_TITLE;
        switch (city) {
            case "Kiev":
                CITY_TITLE = getString(R.string.kiev_title);
                break;
            case "Kharkiv":
                CITY_TITLE = getString(R.string.kharkiv_title);
                break;
            case "Zaporizhia":
                CITY_TITLE = getString(R.string.zaporizhia_title);
                break;
            default:
                CITY_TITLE = city;
                break;
        }
        return CITY_TITLE;
    }

    private int pxToDp(int px) {
        DisplayMetrics displayMetrics = getContext().getResources().getDisplayMetrics();
        int dp = Math.round(px / (displayMetrics.xdpi / DisplayMetrics.DENSITY_DEFAULT));
        return dp;
    }
}
