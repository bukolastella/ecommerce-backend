// google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthProvider, Users } from 'src/users/entities/users.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: config.get('GOOGLE_CLIENT_SECRET')!,
      callbackURL: config.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      const email = profile.emails?.[0]?.value;

      if (!email) {
        return done(new Error('No email from Google'));
      }

      const user = await this.usersRepo.findOneBy({ email });

      if (user) {
        if (user.provider !== AuthProvider.google) {
          return done(new Error('Please login with your email and password'));
        }
        return done(null, user);
      }

      const newUser = this.usersRepo.create({
        provider: AuthProvider.google,
        name: profile.displayName,
        email: email,
        isEmailVerfied: true,
        avatar: profile.photos?.[0]?.value,
        password: null,
      });

      const savedUser = await this.usersRepo.save(newUser);
      return done(null, savedUser);
    } catch (error) {
      return done(error);
    }
  }
}
