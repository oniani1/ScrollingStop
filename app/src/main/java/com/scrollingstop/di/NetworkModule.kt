package com.scrollingstop.di

import com.scrollingstop.data.preferences.SecurePreferences
import com.scrollingstop.trade.binance.BinanceApi
import com.scrollingstop.trade.binance.BinanceSignatureInterceptor
import com.scrollingstop.trade.solana.BirdeyeApi
import com.scrollingstop.trade.solana.HeliusApi
import com.squareup.moshi.Moshi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Named
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideMoshi(): Moshi = Moshi.Builder().build()

    private fun baseClient(): OkHttpClient.Builder {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        }
        return OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
    }

    // Binance

    @Provides
    @Singleton
    @Named("binance")
    fun provideBinanceOkHttpClient(prefs: SecurePreferences): OkHttpClient {
        return baseClient()
            .addInterceptor(BinanceSignatureInterceptor(prefs))
            .build()
    }

    @Provides
    @Singleton
    fun provideBinanceApi(
        @Named("binance") client: OkHttpClient,
        moshi: Moshi
    ): BinanceApi {
        return Retrofit.Builder()
            .baseUrl("https://api.binance.com")
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(BinanceApi::class.java)
    }

    // Helius (Solana parsed transactions)

    @Provides
    @Singleton
    fun provideHeliusApi(moshi: Moshi): HeliusApi {
        return Retrofit.Builder()
            .baseUrl("https://api.helius.xyz")
            .client(baseClient().build())
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(HeliusApi::class.java)
    }

    // Birdeye (Solana token prices)

    @Provides
    @Singleton
    fun provideBirdeyeApi(moshi: Moshi): BirdeyeApi {
        return Retrofit.Builder()
            .baseUrl("https://public-api.birdeye.so")
            .client(baseClient().build())
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(BirdeyeApi::class.java)
    }
}
