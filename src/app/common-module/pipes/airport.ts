import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'airportNameToCountry',
})
export class AirportNameToCountryPipe implements PipeTransform {
  transform(value: string, args?: string): string {
    if (!value) return '';

    const parts = value.split(',').map((part) => part.trim());
    const length = parts.length;

    if (args) {
      switch (args) {
        case '1':
          return parts[0] || '';
        case '2':
          return parts[1] || '';
        case '3':
          return parts[2] || '';
        default:
          return '';
      }
    } else {
      if (length >= 2) {
        return `${parts[length - 2]}, ${parts[length - 1]}`;
      } else {
        return value;
      }
    }
  }
}
