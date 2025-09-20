import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import {
  MessageEntity,
} from './entities/message.entity';

@ApiBearerAuth()
@Roles(RoleEnum.admin, RoleEnum.service)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Messages')
@Controller({
  path: 'messages',
  version: '1',
})
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новое сообщение' })
  @ApiResponse({
    status: 201,
    description: 'Сообщение успешно создано',
    type: MessageEntity,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async create(@Body() createMessageDto: CreateMessageDto): Promise<MessageEntity> {
    return this.messageService.create(createMessageDto);
  }
}
