import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';

interface Cluster {
  id: string;
  name: string;
  namespaces: string[];
}

interface Message {
  content: string;
  role: 'user' | 'assistant';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="container">
      <button class="theme-toggle" (click)="toggleTheme()">
        {{ isDarkTheme ? '☀️ Light' : '🌙 Dark' }}
      </button>
      <div class="side-panel">
        <select class="dropdown" [(ngModel)]="selectedCluster" (ngModelChange)="onClusterChange()">
          <option value="">Select Cluster</option>
          <option *ngFor="let cluster of clusters" [value]="cluster.id">
            {{ cluster.name }}
          </option>
        </select>

        <select class="dropdown" *ngIf="selectedCluster" [(ngModel)]="selectedNamespace">
          <option value="">Select Namespace</option>
          <option *ngFor="let namespace of getNamespaces()" [value]="namespace">
            {{ namespace }}
          </option>
        </select>
      </div>

      <div class="main-content">
        <div class="chat-window" [class.empty]="messages.length === 0">
          <div class="chat-messages" #chatMessages>
            <div *ngFor="let message of messages" 
                 class="message" 
                 [class.user]="message.role === 'user'"
                 [class.assistant]="message.role === 'assistant'">
              <div class="message-content">
                {{ message.content }}
              </div>
              <div class="message-avatar" *ngIf="message.role === 'user'">
                U
              </div>
              <div class="message-avatar" *ngIf="message.role === 'assistant'">
                A
              </div>
            </div>
            <div *ngIf="isLoading" class="message assistant">
              <div class="message-content">
                <div class="loading-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div class="message-avatar">A</div>
            </div>
          </div>
          <div class="chat-input" [class.floating]="messages.length === 0">
            <div class="chat-input-container">
              <textarea
                #messageInput
                [(ngModel)]="currentMessage"
                placeholder="Type your message..."
                (keydown)="onEnterPress($event)"
                rows="1"
                (input)="adjustTextareaHeight(messageInput)"
              ></textarea>
              <button 
                (click)="sendMessage()" 
                [disabled]="!currentMessage.trim() || isLoading">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 2L11 13" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class App {
  clusters: Cluster[] = [
    {
      id: 'cluster1',
      name: 'Production Cluster',
      namespaces: ['default', 'kube-system', 'monitoring'],
    },
    {
      id: 'cluster2',
      name: 'Development Cluster',
      namespaces: ['default', 'dev', 'staging'],
    },
  ];

  selectedCluster: string = '';
  selectedNamespace: string = '';
  messages: Message[] = [];
  currentMessage: string = '';
  isDarkTheme: boolean = false;
  isLoading: boolean = false;

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    document.documentElement.setAttribute(
      'data-theme',
      this.isDarkTheme ? 'dark' : 'light'
    );
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  onClusterChange() {
    this.selectedNamespace = '';
  }

  getNamespaces(): string[] {
    const cluster = this.clusters.find(c => c.id === this.selectedCluster);
    return cluster ? cluster.namespaces : [];
  }

  async sendMessage() {
    if (this.currentMessage.trim() && !this.isLoading) {
      this.messages.push({
        content: this.currentMessage,
        role: 'user'
      });
      
      const userMessage = this.currentMessage;
      this.currentMessage = '';
      this.isLoading = true;

      await new Promise(resolve => setTimeout(resolve, 1000));

      this.messages.push({
        content: `Analyzing logs for ${this.selectedCluster ? `cluster "${this.selectedCluster}"` : 'no cluster selected'}${
          this.selectedNamespace ? ` in namespace "${this.selectedNamespace}"` : ''
        }. Your query: ${userMessage}`,
        role: 'assistant'
      });

      this.isLoading = false;
    }
  }

  onEnterPress(event: KeyboardEvent) {
    if (!event.shiftKey && event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}

bootstrapApplication(App, {
  providers: [
    provideAnimations()
  ]
}).catch(err => console.error(err));