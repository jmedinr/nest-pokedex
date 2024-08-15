import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokemonResponse } from './interfaces/pokemon-response.interface';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.dapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ) {}
  async executeSeed() {
    try {
      await this.deleteAllDocumentsInDataBase();

      const response = await this.http.get<PokemonResponse>(
        'https://pokeapi.co/api/v2/pokemon?limit=100',
      );

      const pokemonToInsert = response.results.map(({ name, url }) => {
        const no = parseInt(url.split('/').slice(-2, -1)[0], 10);
        return { name, no };
      });

      await this.pokemonModel.insertMany(pokemonToInsert);
    } catch (error) {
      throw new InternalServerErrorException('Error while inserting pokemons');
    }
  }

  private async deleteAllDocumentsInDataBase() {
    await this.pokemonModel.deleteMany({});
  }
}
