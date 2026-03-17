package com.scrollingstop.di

import android.content.Context
import androidx.room.Room
import com.scrollingstop.data.db.AppDatabase
import com.scrollingstop.data.db.BlockedAppDao
import com.scrollingstop.data.db.BypassLogDao
import com.scrollingstop.data.db.DailyUsageDao
import com.scrollingstop.data.db.TradeUnlockDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "scrollingstop.db"
        ).build()
    }

    @Provides
    fun provideBlockedAppDao(db: AppDatabase): BlockedAppDao = db.blockedAppDao()

    @Provides
    fun provideDailyUsageDao(db: AppDatabase): DailyUsageDao = db.dailyUsageDao()

    @Provides
    fun provideTradeUnlockDao(db: AppDatabase): TradeUnlockDao = db.tradeUnlockDao()

    @Provides
    fun provideBypassLogDao(db: AppDatabase): BypassLogDao = db.bypassLogDao()
}
