package com.zakorchook.weatherapp;

import android.util.Log;

import com.squareup.okhttp.Callback;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.Response;
import com.zakorchook.weatherapp.bus.ActionProgressBar;
import com.zakorchook.weatherapp.models.WeatherData;

import org.greenrobot.eventbus.EventBus;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Created by Developer Zaharchuk Mihail on 5/27/2016
 */
public class RestClient {

    private static final String TAG = RestClient.class.getSimpleName();

    private static final String ROOT_URL = "http://api.openweathermap.org/data/2.5/weather?q=";
    private static final String LOCALE_QUERY = "&lang=";
    private static final String API_KEY = "&appid=4cfeba127f9ae481a3f34e615d0c9dcf";
    private static OkHttpClient client;
    private static RestClient instance;

    public static RestClient getInstance() {
        if (instance == null) {
            setupRestClient();
        }
        return instance;
    }

    private static void setupRestClient() {
        client = new OkHttpClient();
        client.setReadTimeout(10, TimeUnit.SECONDS);
        client.setConnectTimeout(10, TimeUnit.SECONDS);
        instance = new RestClient();
    }

    public void getDataByCity(final String city, String locale) {
        EventBus.getDefault().post(new ActionProgressBar(true, false));
        final Request request = new Request.Builder()
                .url(makeUrl(city, locale)).build();
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Request request, IOException e) {
                Log.e(TAG, "onFailure: ", e);
                EventBus.getDefault().post(new ActionProgressBar(false, true));
            }

            @Override
            public void onResponse(Response response) throws IOException {
                Log.d(TAG, "onResponse: ");
                if (response.isSuccessful()) {
                    try {
                        JSONObject object = new JSONObject(response.body().string());
                        EventBus.getDefault().post(getWeatherDataFromJson(object, city));
                        EventBus.getDefault().post(new ActionProgressBar(false, false));
                    } catch (JSONException | IllegalStateException | IOException e) {
                        Log.e(TAG, "onResponse: ", e);
                        EventBus.getDefault().post(new ActionProgressBar(false, true));
                    }
                } else {
                    EventBus.getDefault().post(new ActionProgressBar(false, true));
                }
            }
        });
    }

    private String makeUrl(String city, String locale) {
        return ROOT_URL + city + LOCALE_QUERY + locale + API_KEY;
    }


    /**
     * If @param fullObject or some key-values is wrong, return at least some data
     */
    private WeatherData getWeatherDataFromJson(JSONObject fullObject, String city) {
        WeatherData weatherData = new WeatherData();
        weatherData.city = city;
        try {
            JSONObject weatherObject = fullObject.getJSONArray("weather").getJSONObject(0);
            try {
                weatherData.description = weatherObject.getString("description");
            } catch (JSONException ignored) {
            }
            try {
                weatherData.icon = weatherObject.getString("icon");
            } catch (JSONException ignored) {
            }
        } catch (JSONException ignored) {
        }
        try {
            JSONObject mainObject = fullObject.getJSONObject("main");
            try {
                weatherData.temp = mainObject.getDouble("temp");
            } catch (JSONException ignored) {
            }
            try {
                weatherData.temp_min = mainObject.getDouble("temp_min");
            } catch (JSONException ignored) {
            }
            try {
                weatherData.temp_max = mainObject.getDouble("temp_max");
            } catch (JSONException ignored) {
            }
        } catch (JSONException ignored) {
        }
        return weatherData;
    }

    public void close() {
        client = null;
        instance = null;
    }
}
