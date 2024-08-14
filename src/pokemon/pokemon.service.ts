import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { Model } from 'mongoose';
import { isMongoId, isNumberString } from 'class-validator';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      return await this.pokemonModel.create({
        ...createPokemonDto,
        name: createPokemonDto.name,
      });
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll() {
    return await this.pokemonModel.find();
  }

  async findOne(term: string): Promise<Pokemon> {
    let pokemon: Pokemon | null = isMongoId(term)
      ? await this.pokemonModel.findById(term).catch(() => {
          throw new BadRequestException(
            `Cannot find pokemon with id ${term} in database`,
          );
        })
      : null;

    if (!pokemon && isNumberString(term)) {
      pokemon = await this.pokemonModel
        .findOne({ no: Number(term) })
        .catch(() => {
          throw new BadRequestException(
            `Cannot find pokemon with number ${term} in database`,
          );
        });
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel
        .findOne({ name: term.toLocaleLowerCase() })
        .catch((error) => {
          throw new BadRequestException(
            `Cannot find pokemon with name ${term.toLocaleLowerCase()} in database`,
          );
        });
    }

    if (!pokemon) {
      throw new NotFoundException('Pokemon not found');
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    this.updatePokemonName(pokemon, updatePokemonDto);

    await this.saveUpdatedPokemon(pokemon, updatePokemonDto, term);

    return this.mergeUpdatedPokemon(pokemon, updatePokemonDto);
  }

  private updatePokemonName(
    pokemon: Pokemon,
    updatePokemonDto: UpdatePokemonDto,
  ) {
    if (updatePokemonDto.name) {
      pokemon.name = updatePokemonDto.name.toLocaleLowerCase();
    }
  }

  private async saveUpdatedPokemon(
    pokemon: Pokemon,
    updatePokemonDto: UpdatePokemonDto,
    term: string,
  ) {
    try {
      await pokemon.updateOne(
        { ...updatePokemonDto, name: pokemon.name },
        { new: true },
      );
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  private mergeUpdatedPokemon(
    pokemon: Pokemon,
    updatePokemonDto: UpdatePokemonDto,
  ) {
    updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    return { ...pokemon.toJSON(), ...updatePokemonDto };
  }

  private handleExceptions = (error: any) => {
    if (error.code === 11_000) {
      throw new BadRequestException('Pokemon already exists');
    }

    throw new InternalServerErrorException(
      'error occurred whit the pokemon server',
    );
  };

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel
      .deleteOne({ _id: id })
      .catch((error: { message: any }) => {
        throw new InternalServerErrorException(error.message);
      });

      if (deletedCount === 0) {
        throw new NotFoundException(`Could not find pokemon with given id ${id} in the database. Please make sure the id is correct.`);
      }

    return deletedCount > 0;
  }
}
