import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      url: 'redis://localhost:6379',
      ttl: 3600, // 1 hour
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}