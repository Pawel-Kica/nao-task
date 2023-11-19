import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import config from '../../config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    const apiKey = headers['x-api-key'] || request.query['x-api-key'];

    const internalApiKey = config.internalApiKEy;
    if (!internalApiKey)
      throw new InternalServerErrorException('AUTH_NOT_CONFIGURED');

    if (internalApiKey !== apiKey)
      throw new UnauthorizedException('INVALID_API_KEY');

    return true;
  }
}
