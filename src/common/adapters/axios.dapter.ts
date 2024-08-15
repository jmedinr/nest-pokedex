import axios, { AxiosInstance } from 'axios';
import { HttpAdapter } from '../interfaces/http-adapter.interface';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AxiosAdapter implements HttpAdapter {
  private readonly httpAxios: AxiosInstance;

  constructor() {
    this.httpAxios = axios;
  }

  async get<T>(url: string): Promise<T> {
    try {
      const { data } = await this.httpAxios.get<T>(url);
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while getting data from API',
      );
    }
  }
}
