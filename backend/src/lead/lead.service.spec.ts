import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { LeadService } from './lead.service';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto, LeadStatus, LeadSource } from './dto/create-lead.dto';

describe('LeadService', () => {
  let service: LeadService;
  let repository: Repository<Lead>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        {
          provide: getRepositoryToken(Lead),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LeadService>(LeadService);
    repository = module.get<Repository<Lead>>(getRepositoryToken(Lead));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new lead', async () => {
      const createLeadDto: CreateLeadDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        telegramUsername: '@johndoe',
        company: 'Test Company',
      };

      const mockLead = { id: 1, ...createLeadDto, status: LeadStatus.NEW };

      mockRepository.create.mockReturnValue(mockLead);
      mockRepository.save.mockResolvedValue(mockLead);

      const result = await service.create(createLeadDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createLeadDto,
        status: LeadStatus.NEW,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockLead);
      expect(result).toEqual(mockLead);
    });
  });

  describe('findAll', () => {
    it('should return all leads', async () => {
      const mockLeads = [
        { id: 1, name: 'John Doe', status: LeadStatus.NEW },
        { id: 2, name: 'Jane Smith', status: LeadStatus.CONTACTED },
      ];

      mockRepository.find.mockResolvedValue(mockLeads);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockLeads);
    });
  });

  describe('findOne', () => {
    it('should return a lead by id', async () => {
      const mockLead = { id: 1, name: 'John Doe', status: LeadStatus.NEW };

      mockRepository.findOne.mockResolvedValue(mockLead);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockLead);
    });

    it('should throw NotFoundException when lead not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTelegramId', () => {
    it('should return a lead by telegram id', async () => {
      const mockLead = { id: 1, telegramId: '123456789', name: 'John Doe' };

      mockRepository.findOne.mockResolvedValue(mockLead);

      const result = await service.findByTelegramId('123456789');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { telegramId: '123456789' },
      });
      expect(result).toEqual(mockLead);
    });
  });
});
