import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Hero} from '../hero';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-hero-detail',
  imports: [CommonModule, FormsModule, NgIf],
  templateUrl: './hero-detail.component.html',
  styleUrl: './hero-detail.component.scss'
})

export class HeroDetailComponent {
  @Input() hero?: Hero;
}
