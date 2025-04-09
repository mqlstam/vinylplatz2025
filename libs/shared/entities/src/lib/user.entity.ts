import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, ManyToMany, JoinTable, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { Vinyl } from './vinyl.entity'; // Ensure this path is correct relative to user.entity.ts
import { Order } from './order.entity'; // Ensure this path is correct relative to user.entity.ts

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // Added definite assignment assertion

  @Column({ length: 100 })
  name!: string; // Added definite assignment assertion

  @Column({ unique: true })
  email!: string; // Added definite assignment assertion

  @Column()
  @Exclude({ toPlainOnly: true })
  password!: string; // Added definite assignment assertion

  @Column({ nullable: true })
  profileImage?: string;

  @Column({ nullable: true })
  address?: string;
  
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole; // Added definite assignment assertion

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registrationDate!: Date; // Added definite assignment assertion

  // Added explicit type (vinyl: Vinyl)
  @OneToMany(() => Vinyl, (vinyl: Vinyl) => vinyl.seller)
  vinyls!: Vinyl[]; // Added definite assignment assertion

  // Added explicit type (order: Order)
  @OneToMany(() => Order, (order: Order) => order.buyer)
  purchases!: Order[]; // Added definite assignment assertion

  // Added explicit type (order: Order)
  @OneToMany(() => Order, (order: Order) => order.seller)
  sales!: Order[]; // Added definite assignment assertion

  // Added explicit type (vinyl: Vinyl) and corrected inverse relation reference
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
  favorites!: Vinyl[]; // Added definite assignment assertion

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Only hash the password if it has been modified (check if it looks like a hash)
    if (this.password && (!this.password.startsWith('') || this.password.length < 50)) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }
}
