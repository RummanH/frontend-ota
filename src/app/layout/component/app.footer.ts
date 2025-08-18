import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  template: `
    <footer class="text-gray-700 dark:text-gray-300 py-8 ">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm sm:text-base font-medium">© 2026 <span class="text-orange-500 font-bold">Mohammad Rumman</span>. All Rights Reserved.</p>

        <div class="flex gap-6">
          <a href="#" class="hover:text-orange-500 transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-orange-500 transition-colors">Terms of Service</a>
          <a href="#" class="hover:text-orange-500 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  `,
})
export class AppFooter {}
