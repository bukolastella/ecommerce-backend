import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from 'src/auth/dto/auth.dto';
import { AuthService } from 'src/auth/auth.service';
import { Public } from 'src/public.decorator';

@Controller('admin')
export class AdminController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
