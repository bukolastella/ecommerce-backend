import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ResponseWrapperInterceptor } from './response/response-wrapper.interceptor';
async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());

    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(reflector),
      new ResponseWrapperInterceptor(),
    );
    app.enableCors();

    const config = new DocumentBuilder()
      .setTitle('E-commerce')
      .setDescription('The e-commerce API description')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token here',
      })
      .addSecurity('adminToken', {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for Admin',
      })
      .addSecurity('businessToken', {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for Business',
      })
      .addSecurity('userToken', {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for Users',
      })
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
    console.log('hmmm');

    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
    console.log('🚀 App is running!');
  } catch (error) {
    console.error('❌ Error starting the app:', error);
  }
}

bootstrap();
