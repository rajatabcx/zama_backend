import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UserId } from 'src/decorators';
import { UpdateUserDTO } from './dto';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  profile(@UserId() userId: string) {
    return this.userService.profile(userId);
  }

  @Patch('/:userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDTO,
  ) {
    return this.userService.update(userId, updateUserDto);
  }
}
