import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLeadDto, LeadStatus } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './entities/lead.entity';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadRepository.create({
      ...createLeadDto,
      status: createLeadDto.status || LeadStatus.NEW,
    });
    return await this.leadRepository.save(lead);
  }

  async findAll(): Promise<Lead[]> {
    return await this.leadRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Lead> {
    const lead = await this.leadRepository.findOne({ where: { id } });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async update(id: number, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);
    Object.assign(lead, updateLeadDto);
    return await this.leadRepository.save(lead);
  }

  async remove(id: number): Promise<void> {
    const lead = await this.findOne(id);
    await this.leadRepository.remove(lead);
  }

  async findByTelegramId(telegramId: string): Promise<Lead | null> {
    return await this.leadRepository.findOne({ where: { telegramId } });
  }

  async findByEmail(email: string): Promise<Lead | null> {
    return await this.leadRepository.findOne({ where: { email } });
  }

  async findByStatus(status: LeadStatus): Promise<Lead[]> {
    return await this.leadRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }
}
