import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshToken1766864397987 implements MigrationInterface {
    name = 'AddRefreshToken1766864397987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "token" text NOT NULL, "userId" uuid NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "userAgent" text, "ipAddress" text, CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e59cfb4ce9deac3c9411eaa0e0" ON "refresh_tokens" ("userId", "isRevoked") `);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e59cfb4ce9deac3c9411eaa0e0"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    }

}
