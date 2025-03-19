import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule], // or you can use [NgIf] if you only need ngIf
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
  providers: [MessageService]
})
export class MessagesComponent {
  constructor(public messageService: MessageService) {}
}
