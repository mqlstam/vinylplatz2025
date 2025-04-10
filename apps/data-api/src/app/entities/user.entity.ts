import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, ManyToMany, JoinTable, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { Vinyl } from './vinyl.entity';
import { Order } from './order.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password!: string;

  @Column({ nullable: true })
  profileImage?: string;

  @Column({ nullable: true })
  address?: string;
  
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registrationDate!: Date;

  @OneToMany(() => Vinyl, (vinyl: Vinyl) => vinyl.seller)
  vinyls!: Vinyl[];

  @OneToMany(() => Order, (order: Order) => order.buyer)
  purchases!: Order[];

  @OneToMany(() => Order, (order: Order) => order.seller)
  sales!: Order[];

  @ManyToMany(() => Vinyl, (vinyl: Vinyl) => vinyl.favoritedBy) 
  @JoinTable({
    name: 'user_favorites',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'vinylId',
      referencedColumnName: 'id'
    }
  })
  favorites!: Vinyl[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && (!this.password.startsWith('') || this.password.length < 50)) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }
}
