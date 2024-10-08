import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isMongoId } from 'class-validator';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (isMongoId(value)) {
      return value;
    }
    throw new BadRequestException(`Invalid Mongo ID format: ${value}`);
  }
}
