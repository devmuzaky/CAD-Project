import {AfterViewInit, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterViewInit {
  cy: any;

  @Input() nodes: any;
  @Input() edges: any;

  _treeBranches: string[] = [];
  get treeBranches(): string[] {
    return this._treeBranches;
  }
 @Input("treeBranches") set treeBranches(value: string[]) {
    this._treeBranches = value;
    console.log({value})
   this.ref.detectChanges();
    if (this.cy) {
      // update element
      this.cy.elements().remove()

      this.cy.add({
        nodes: this.nodes,
        // TODO: pass
        edges: this.edges,
       treeBranches: value
      })
    }
 }



  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit(): void {
  }


  ngAfterViewInit(): void {
    console.log(this._treeBranches)
    console.log('ngAfterViewInit');
    // @ts-ignore
    this.cy = cytoscape({
      container: document.getElementById('cy'),

      boxSelectionEnabled: false,
      autounselectify: true,
      // @ts-ignore
      style: cytoscape.stylesheet()
        .selector('node')
        .style({
          'content': 'data(id)'
        })
        .selector('edge')
        .style({
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'width': 4,
          'line-color': '#ddd',
          'target-arrow-color': '#ddd'
        })
        .selector('.highlighted')
        .style({
          'background-color': '#61bffc',
          'line-color': '#61bffc',
          'target-arrow-color': '#61bffc',
          'transition-property': 'background-color, line-color, target-arrow-color',
          'transition-duration': '0.5s'
        }),

      // TODO: pass
      elements: {
        nodes: this.nodes,

        // TODO: pass
        edges: this.edges
      },

      layout: {
        name: 'breadthfirst',
        directed: true,
        roots: '#a',
        padding: 10
      }
    });

    console.log(this.cy.edges()[0].data('id'));
    console.log(this.cy.edges().filter((edge: any) => ['ae'].includes(edge.data('id'))));
    this.cy.edges().filter((edge: any) => this._treeBranches.includes(edge.data('id'))).addClass('highlighted');
    this.cy.edges().filter((edge: any) => !this._treeBranches.includes(edge.data('id'))).removeClass('highlighted');
    this.cy.on('add', 'node', (_evt: any) => {
      this.cy.layout({
        name: 'breadthfirst',
        directed: true,
        roots: '#a',
        padding: 10
      }).run()
      this.cy.fit()
    })
  }
}
