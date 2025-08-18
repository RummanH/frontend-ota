import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        <p class="text-base text-gray-800 font-semibold">
            Copyright © 2005-2025
            <a href="https://www.sabre.com/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold"> Sabre </a>
        </p>
    </div>`
})
export class AppFooter {}
