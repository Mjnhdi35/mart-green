import { Exclude } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseModelEntity } from '../../core/entities/base.entity';

@Entity('users')
export class User extends BaseModelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column()
  @Exclude()
  password: string;
}
