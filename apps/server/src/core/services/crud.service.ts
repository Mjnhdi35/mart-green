import { Logger, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

export abstract class CrudService<T extends ObjectLiteral> {
  protected readonly logger: Logger;
  constructor(protected readonly repository: Repository<T>) {
    this.logger = new Logger(this.constructor.name);
  }

  async create(dto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(dto);
    return await this.repository.save(entity);
  }

  async findAll(): Promise<T[]> {
    return await this.repository.find();
  }

  async findOne(id: string): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
    if (!entity) throw new NotFoundException(`Entity with ID ${id} not found`);
    return entity;
  }

  async update(id: string, dto: DeepPartial<T>): Promise<T> {
    const entity = await this.findOne(id);
    if (!entity) throw new NotFoundException(`Entity with ID ${id} not found`);
    const updated = this.repository.merge(entity, dto);
    return await this.repository.save(updated);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.findOne(id);
    if (!entity) throw new NotFoundException(`Entity with ID ${id} not found`);
    await this.repository.remove(entity);
  }
}
