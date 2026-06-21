import { Component, input } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';

@Component({
    selector:'app-accordion',
    templateUrl: './Accordion.html',
    standalone: true,
    imports: [AccordionModule]
})
export class AccordionBasicDemo {
    header = input.required<string>()
    content = input.required<string>()
    panelVal = input.required<string>()
}