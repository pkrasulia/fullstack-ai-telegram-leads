import { Test, TestingModule } from '@nestjs/testing';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { CreateLeadDto, LeadStatus, LeadSource } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

describe('LeadController', () => {
  let controller: LeadController;
  let service: LeadService;

  const mockLeadService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByTelegramId: jest.fn(),
    findByEmail: jest.fn(),
    findByStatus: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadController],
      providers: [
        {
          provide: LeadService,
          useValue: mockLeadService,
        },
      ],
    }).compile();

    controller = module.get<LeadController>(LeadController);
    service = module.get<LeadService>(LeadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      mockLeadService.create.mockResolvedValue(mockLead);

      const result = await controller.create(createLeadDto);

      expect(service.create).toHaveBeenCalledWith(createLeadDto);
      expect(result).toEqual(mockLead);
    });
  });

  describe('findAll', () => {
    it('should return all leads', async () => {
      const mockLeads = [
        { id: 1, name: 'John Doe', status: LeadStatus.NEW },
        { id: 2, name: 'Jane Smith', status: LeadStatus.CONTACTED },
      ];

      mockLeadService.findAll.mockResolvedValue(mockLeads);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockLeads);
    });

    it('should return leads filtered by status', async () => {
      const mockLeads = [{ id: 1, name: 'John Doe', status: LeadStatus.NEW }];

      mockLeadService.findByStatus.mockResolvedValue(mockLeads);

      const result = await controller.findAll(LeadStatus.NEW);

      expect(service.findByStatus).toHaveBeenCalledWith(LeadStatus.NEW);
      expect(result).toEqual(mockLeads);
    });
  });

  describe('findOne', () => {
    it('should return a lead by id', async () => {
      const mockLead = { id: 1, name: 'John Doe', status: LeadStatus.NEW };
      mockLeadService.findOne.mockResolvedValue(mockLead);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockLead);
    });
  });

  describe('findByTelegramId', () => {
    it('should return a lead by telegram id', async () => {
      const mockLead = { id: 1, telegramId: '123456789', name: 'John Doe' };
      mockLeadService.findByTelegramId.mockResolvedValue(mockLead);

      const result = await controller.findByTelegramId('123456789');

      expect(service.findByTelegramId).toHaveBeenCalledWith('123456789');
      expect(result).toEqual(mockLead);
    });

    it('should throw error when lead not found by telegram id', async () => {
      mockLeadService.findByTelegramId.mockResolvedValue(null);

      await expect(controller.findByTelegramId('999999999')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a lead', async () => {
      const updateLeadDto: UpdateLeadDto = { name: 'Updated Name' };
      const mockLead = { id: 1, name: 'Updated Name', status: LeadStatus.NEW };

      mockLeadService.update.mockResolvedValue(mockLead);

      const result = await controller.update(1, updateLeadDto);

      expect(service.update).toHaveBeenCalledWith(1, updateLeadDto);
      expect(result).toEqual(mockLead);
    });
  });

  describe('remove', () => {
    it('should remove a lead', async () => {
      mockLeadService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
