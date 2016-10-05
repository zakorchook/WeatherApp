package com.zakorchook.weatherapp.fragments;

import android.content.res.Configuration;
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
import com.zakorchook.weatherapp.R;
import com.zakorchook.weatherapp.RestClient;
import com.zakorchook.weatherapp.models.WeatherData;
import com.zakorchook.weatherapp.util.MyConstants;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

import java.util.Locale;


public class WeatherFragment extends Fragment {

    private static final String TAG = WeatherFragment.class.getSimpleName();
    private static final String ARG_CITY = "ARG_CITY";
    private static final String BASE_ICON_URL = "http://openweathermap.org/img/w/";
    private static final String ICON_FORMAT = ".png";

    private TextView textViewCity;
    private TextView textViewTemp;
    private TextView textViewTempMin;
    private TextView textViewTempMax;
    private TextView textViewDescription;

    private ImageView imageViewWeather;

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
            currentCity = getArguments().getString(ARG_CITY, MyConstants.KIEV);
        }
        EventBus.getDefault().register(this);
        setRetainInstance(true);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        if (v == null) {
            v = inflater.inflate(R.layout.fragment_weather, container, false);
            initViews(v);
            RestClient.getInstance().getDataByCity(currentCity, Locale.getDefault().getLanguage());
        }
        return v;
    }

    @Override
    public void onDestroy() {
        EventBus.getDefault().unregister(this);
        super.onDestroy();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Log.d(TAG, "onConfigurationChanged: ");
    }

    private void initViews(View v) {
        imageViewWeather = (ImageView) v.findViewById(R.id.imageWeather);
        textViewCity = (TextView) v.findViewById(R.id.textCity);
        textViewTemp = (TextView) v.findViewById(R.id.textTemp);
        textViewTempMin = (TextView) v.findViewById(R.id.textTempMin);
        textViewTempMax = (TextView) v.findViewById(R.id.textTempMax);
        textViewDescription = (TextView) v.findViewById(R.id.description);
    }

    private void refreshUI(WeatherData currentWeatherData) {
        if (currentWeatherData != null) {
            if (currentWeatherData.icon != null)
                Glide.with(WeatherFragment.this)
                        .load(BASE_ICON_URL + currentWeatherData.icon + ICON_FORMAT)
                        .placeholder(R.drawable.ic_question)
                        .into(imageViewWeather);
            // can't be null
            textViewCity.setText(getCityTitle(currentWeatherData.city));
            // calculate textViewTemp size for other screen size and configuration
            textViewTemp.setTextSize(pxToDp((int) (getResources().getDimension(R.dimen.weather_image_size) * 0.4f)));

            textViewTemp.setText(fromKelvinToCelsius(currentWeatherData.temp));
            textViewTempMin.setText(fromKelvinToCelsius(currentWeatherData.temp_min));
            textViewTempMax.setText(fromKelvinToCelsius(currentWeatherData.temp_max));

            if (currentWeatherData.description != null)
                textViewDescription.setText(currentWeatherData.description);
        }
    }

    private String fromKelvinToCelsius(double kelvin) {
        final int ABS_NULL = 273;
        final String DEGREE = (char) 0x00B0 + "C";
        if (kelvin > ABS_NULL)
            return "+" + (int) Math.round(kelvin - ABS_NULL) + DEGREE;
        else
            return (int) Math.round(kelvin - ABS_NULL) + DEGREE;
    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onEvent(final WeatherData event) {
        currentCity = event.city;
        refreshUI(event);
    }

    private String getCityTitle(String city) {
        final String CITY_TITLE;
        switch (city) {
            case MyConstants.KIEV:
                CITY_TITLE = getString(R.string.kiev_title);
                break;
            case MyConstants.KHARKIV:
                CITY_TITLE = getString(R.string.kharkiv_title);
                break;
            case MyConstants.ZAPORIZHIA:
                CITY_TITLE = getString(R.string.zaporizhia_title);
                break;
            default:
                CITY_TITLE = city;
                break;
        }
        return CITY_TITLE;
    }

    private int pxToDp(int px) {
        final DisplayMetrics displayMetrics = getContext().getResources().getDisplayMetrics();
        return Math.round(px / (displayMetrics.xdpi / DisplayMetrics.DENSITY_DEFAULT));
    }
}
