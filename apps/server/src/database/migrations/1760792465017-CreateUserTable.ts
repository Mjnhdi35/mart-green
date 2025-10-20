import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1760792465017 implements MigrationInterface {
  name = 'CreateUserTable1760792465017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "bio" character varying`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "avatar" character varying`,
    );
  }
}
