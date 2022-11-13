import { Component } from '@angular/core';
import * as math from 'mathjs';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  branch_row_size!: any;
  branch_col_size!:any;
  link_col_size!: any;

  C_tree_global!: any;
  C_link_global!: any;
  B_tree_global!:any;
  B_link_global!: any;
  ZB_0_YB_1!: any;

  ZB: any = [];
  EB: any = [];
  IB: any = [];
  YB: any = [];
  VB: any = [];
  JB: any = [];

  triggerModal() {
    const modal = new Modal('#basiceModal');
    modal.toggle();
  }


  generateZBorYB(event: MouseEvent) {
    if (this.ZB_0_YB_1 === 0)
      this.generateZB(event)
    else
      this.generateYB(event)
  }

  generateEB_IB() {
    let size = this.branch_col_size + this.link_col_size;

    let html_EB = '';
    for (let i = 0; i < size; i++) {
      html_EB += `<tr><td><input type="text" name="EB" class="EB" size="3"></tr>`
    }


    let html_IB = ''
    for (let i = 0; i < size; i++) {
      html_IB += `<tr><td><input type="text" name="IB" class="IB" size="3"></tr>`
    }

    (document.getElementById("EB-body") as HTMLElement).innerHTML = html_EB;
    (document.getElementById("IB-body") as HTMLElement).innerHTML = html_IB;

    (new Modal('#EB_IB_modal')).toggle();

    // TODO: remove if possible
    setTimeout(() => {
      let height = (document.querySelector("#EB-table") as HTMLElement).offsetHeight;

      (document.querySelector("#EB-text") as HTMLElement).style.lineHeight = height + "px"

      height = (document.querySelector("#IB-table") as HTMLElement).offsetHeight;
      (document.querySelector("#IB-text") as HTMLElement).style.lineHeight = height + "px";
    }, 250)

  }

  handleResult_with_ZB() {
    let B_total = math.concat(this.B_tree_global, this.B_link_global);
    let B_transpose = math.transpose(B_total);


    let ZB_B_transpose = math.multiply(this.ZB, B_transpose)
    let B_ZB_B_transpose = math.multiply(B_total, ZB_B_transpose)

    let B_EB = math.multiply(B_total, this.EB);

    let ZB_IB = math.multiply(this.ZB, this.IB)
    let B_ZB_IB = math.multiply(B_total, ZB_IB)

    let right = math.subtract(B_EB, B_ZB_IB)

    let IL = math.multiply(math.inv(B_ZB_B_transpose), right)

    this.JB = math.multiply(B_transpose, IL)

    // Voltage
    let all_currents = math.add(this.JB, this.IB)

    let ZB_all_currents = math.multiply(this.ZB, all_currents)

    this.VB = math.subtract(ZB_all_currents, this.EB)
  }

  handleResult_with_YB() {
    let C_total = math.concat(this.C_tree_global, this.C_link_global)

    let C_transpose = math.transpose(C_total)

    let YB_C_transpose = math.multiply(this.YB, C_transpose)

    let C_YB_C_transpose = math.multiply(C_total, YB_C_transpose)


    let C_IB = math.multiply(C_total, this.IB)

    let YB_EB = math.multiply(this.YB, this.EB)
    let C_YB_EB = math.multiply(C_total, YB_EB)

    let right = math.subtract(C_IB, C_YB_EB)

    let EN = math.multiply(math.inv(C_YB_C_transpose), right)

    let VB = math.multiply(C_transpose, EN)

    // Current
    let all_volts = math.add(VB, this.EB)

    let YB_all_volts = math.multiply(this.YB, all_volts)

    this.JB = math.subtract(YB_all_volts, this.IB)
  }

  calculateResult(event: Event) {
    let noError = this.handleEB_IB();

    if (!noError)
      return;


    if (this.ZB_0_YB_1 == 0)
      this.handleResult_with_ZB()
    else {
      this.handleResult_with_YB()
    }

    const size = this.branch_col_size + this.link_col_size;

    let html_VB = '';

    for (let i = 0; i < size; i++) {
      html_VB += `<tr><td>${this.VB._data[i][0].toFixed(3)}</td></tr>`
    }

    let html_JB = ''
    for (let i = 0; i < size; i++) {
      html_JB += `<tr><td>${this.JB._data[i][0].toFixed(3)}</td></tr>`
    }

    (document.getElementById("VB-body") as HTMLElement).innerHTML = html_VB;
    (document.getElementById("JB-body") as HTMLElement).innerHTML = html_JB;

   (new Modal('#VB_JB_modal')).toggle();

    // TODO: remove if possible
    setTimeout(() => {
      let height = (document.querySelector("#VB-table") as HTMLElement).offsetHeight;
      document.querySelector<HTMLElement>("#VB-text")!.style.lineHeight = height + "px";

      height = document.querySelector<HTMLElement>("#JB-table")!.offsetHeight;
      document.querySelector<HTMLElement>("#JB-text")!.style.lineHeight = height + "px";
    }, 250)
  }

  handleEB_IB() {
    let error = false
    let arr_EB: number[][] = []
    let arr_IB: number[][] = [];

    (document.querySelectorAll(".EB") as any).forEach((element: any): any => {
      if (isNaN(parseInt(element.value))) {
        error = true
        return Swal.fire({
          icon: 'error',
          text: 'You should Enter All EB Matrix Values as Numbers',
          confirmButtonText: 'Ok'
        })
      }
      arr_EB.push([parseInt(element.value)])
    })

    document.querySelectorAll(".IB").forEach((element: any): any => {
      if (isNaN(parseInt(element.value))) {
        error = true
        return Swal.fire({
          icon: 'error',
          text: 'You should Enter All IB Matrix Values as Numbers',
          confirmButtonText: 'Ok'
        })
      }
      arr_IB.push([parseInt(element.value)])
    })

    this.EB = arr_EB
    this.IB = arr_IB

    return !error;
  }

  generateYB(e: MouseEvent) {
    this.ZB_0_YB_1 = 1

    let res = this.handleMatrixA(e);
    if (res != "yes")
      return;

    e.preventDefault();

    const size = this.branch_col_size + this.link_col_size;

    let identity = (math.identity(size) as any)._data;

    let html = '';
    identity.forEach((arr: any) => {
      html += '<tr>'
      arr.forEach((number: number) => {
        if (number == 0)
          html += `<td><input type="text" size="3" disabled value="0"></td>`
        else
          html += `<td><input type="text" class="YB" size="3"></td>`

      })
      html += '</tr>'
    })

    (document.getElementById("YB-body") as HTMLElement).innerHTML = html;


    (new Modal('#YB_modal')).toggle();

    // TODO: remove if possible
    setTimeout(() => {
      let widthOfTable = document.querySelector("#YB-body")!.scrollWidth
      document.querySelector<HTMLElement>("#modal-YB")!.style.maxWidth = (widthOfTable + 60).toString() + "px"
    }, 250)

  }

  handleYB(e: MouseEvent) {
    e.preventDefault();

    this.YB = [];

    document.querySelectorAll(".YB").forEach((element: any): any => {
      if (isNaN(parseInt(element.value))) {
        Swal.fire({
          icon: 'error',
          text: 'Please Enter a Valid YB Matrix',
          confirmButtonText: 'Ok'
        })

        // TODO: check if this working -> should not reach here
        this.generateYB(e);

        return false;
      }

      this.YB.push(parseInt(element.value))
    })

    this.YB = math.diag(this.YB)

    this.generateEB_IB()

    return true
  }

  generateZB(e: MouseEvent) {
    this.ZB_0_YB_1 = 0

    const res = this.handleMatrixA(e);
    if (res != "yes")
      return;

    const size = this.branch_col_size + this.link_col_size;
    e.preventDefault()
    let identity = (math.identity(size) as any)._data

    let html = ''
    identity.forEach((arr: any[]) => {
      html += '<tr>'
      arr.forEach((number) => {
        if (number == 0)
          html += `<td><input type="text" size="3" disabled value="0"></td>`
        else
          html += `<td><input type="text" class="ZB" size="3"></td>`

      })
      html += '</tr>'
    })

    document.getElementById("ZB-body")!.innerHTML = html;


    (new Modal('#ZB_modal')).toggle();

    setTimeout(() => {
      let widthOfTable = document.querySelector<HTMLElement>("#ZB-body")!.scrollWidth
      document.querySelector<HTMLElement>("#modal-ZB")!.style.maxWidth = (widthOfTable + 60).toString() + "px"
    }, 250)

  }

  handleZB(e: MouseEvent) {
    e.preventDefault()

    this.ZB = []

    document.querySelectorAll(".ZB").forEach((element: any): any => {
      if (isNaN(parseInt(element.value))) {
        Swal.fire({
          icon: 'error',
          text: 'Please Enter a Valid ZB Matrix',
          confirmButtonText: 'Ok'
        })

        this.generateZB(e)

        return false
      }
      this.ZB.push(parseInt(element.value))
    })

    this.ZB = math.diag(this.ZB)

    this.generateEB_IB()

    return true
  }

  generateMatrix(e: Event) {
    e.preventDefault()

    const row_size = parseInt(document.querySelector<HTMLInputElement>('#row-size')!.value)
    const col_size = parseInt(document.querySelector<HTMLInputElement>('#col-size')!.value)


    this.link_col_size = col_size - row_size + 1
    this.branch_col_size = col_size - this.link_col_size
    this.branch_row_size = row_size - 1

    if (this.branch_row_size < 1 || isNaN(this.branch_row_size) ||
      this.branch_col_size < 1 || isNaN(this.branch_col_size) ||
      this.link_col_size < 1 || isNaN(this.link_col_size)) {
      Swal.fire({
        icon: 'error',
        text: 'Please Enter a Valid Size',
        confirmButtonText: 'Ok'
      })
      return;
    }


    let code = ''

    for (let i = 0; i < this.branch_row_size; i++) {
      code += '<tr>'

      code += '<td class="branch">'
      for (let j = 0; j < this.branch_col_size; j++) {
        code += `<input type="text" name="field${i}${j}" size="3">`
      }
      code += '</td>'

      code += '<td class="link">'
      for (var j = 0; j < this.link_col_size; j++) {
        code += `<input type="text" name="field${i}${j}" size="3">`
      }
      code += '</td>'


      code += '</tr>'
    }

    document.getElementById("matrix")!.innerHTML = code;
    document.getElementById("inputField")!.style.display = "block";
  }

  nodeData: { data: { id: string; }; }[] = [];
  highlighted: string[] = [];
  edges: { data: { id: string; weight: number; source: string; target: string; }; }[] = [];
  show = false;
  handleMatrixA(e: Event, type_of_operation = "") {
    this.highlighted = [];
    this.nodeData = []
    this.edges = []

    console.log("handleMatrixA")
    e.preventDefault();

    try {
      const {
        branchMatrix,
        linkMatrix
      } = this.generateMatrixFromForm()


      // nodes
      const nodes = Array(this.branch_row_size + 1).fill(0).map((_, i) => i + 1)


      nodes.forEach((node) => {
        this.nodeData.push({data: { id: `${node}` }});
      })


      this.highlighted = [];

      this.show = false;

      const ourbranch = []
      for (let i = 0; i < branchMatrix[0].length; i++) {
        const col = []
        for (let j = 0; j < branchMatrix.length; j++) {
          col.push(branchMatrix[j][i]);
        }
        ourbranch.push(col);
      }

      const ourLink = []
      for (let i = 0; i < linkMatrix[0].length; i++) {
        const col = []
        for (let j = 0; j < branchMatrix.length; j++) {
          col.push(linkMatrix[j][i]);
        }
        ourLink.push(col);
      }


      let weight = 1;
      // highlight tree edges
      console.log(ourbranch)
      for (let i = 0; i < ourbranch.length; i++) {
        for (let j = 0; j < ourbranch[i].length; j++) {
          console.log(i, j)
          if (ourbranch[i][j] == 1 || ourbranch[i][j] == -1) {
            // check element before me has one
            let found = false;
            for (let k = 0; k < j; k++) {
              if (ourbranch[i][k] == 1 || ourbranch[i][k] == -1) {
                found = true;
                break;
              }
            }
            if (found) continue;


            const toFind = ourbranch[i][j] * -1;

            let target = ourbranch[i].indexOf(toFind, j + 1) + 1;

            if (target === 0) target = ourbranch[i].length + 1;

            let source = j+1
            if (ourbranch[i][j] === -1) [source, target] = [target, source];

            this.edges.push({data: { id: `${source}${target}`, weight: weight++, source: `${source}`, target: `${target}` }})
            console.log()
            console.log({i, j}, `${source}${target}`)
            this.highlighted.push(`${source}${target}`);
          }
        }
      }

      for (let i = 0; i < ourLink.length; i++) {
        for (let j = 0; j < ourLink[i].length; j++) {
          if (ourLink[i][j] == 1 || ourLink[i][j] == -1) {
            const toFind = ourLink[i][j] * -1;

            let target = ourLink[i].indexOf(toFind, j + 1) + 1;

            if (target === 0) target = ourLink[i].length + 1;

            let source = j+1
            if (ourLink[i][j] === -1) [source, target] = [target, source];

            this.edges.push({data: { id: `${source}${target}`, weight: weight++,source: `${source}`, target: `${target}` }})
          }
        }
      }

      this.show = true;

      const {
        C_branch,
        C_link
      } = this.calculateMatrixC(branchMatrix, linkMatrix, this.branch_col_size)


      this.C_tree_global = C_branch
      this.C_link_global = C_link

      if (type_of_operation == "calc_C") {
        return this.printMatrix(C_branch, C_link, "C matrix")
      }

      const {
        B_tree,
        B_link
      } = this.calculateMatrixB(C_link, this.link_col_size)
      this.B_tree_global = B_tree
      this.B_link_global = B_link

      if (type_of_operation == "calc_B") {
        return this.printMatrix(B_tree, B_link, "B matrix")
      }

      return "yes"
    } catch (err) {
      return Swal.fire({
        icon: 'error',
        text: 'Please Enter a Valid Matrix',
        confirmButtonText: 'Ok'
      })
    }
  }


  calculateMatrixC(branchMatrix: any, linkMatrix: any, A_branch_col_size: any) {
    const A_tree_inverse = math.inv(branchMatrix)

    const C_link = math.multiply(A_tree_inverse, linkMatrix)

    const C_branch = math.identity(A_branch_col_size, A_branch_col_size)

    return {
      C_branch,
      C_link
    }
  }

  calculateMatrixB(C_link: any, link_col_size: any) {
    const B_branch = math.dotMultiply(math.transpose(C_link), -1)

    // Get B_link
    const size = link_col_size
    const B_link = math.identity(size, size)

    return {
      B_tree: B_branch,
      B_link
    }
  }

  printMatrix(tree: any, link: any, h2: any) {
    const all_matrix = (math.concat(tree, link) as any)._data

    const body = document.getElementById("result-body")

    let html = ''

    all_matrix.forEach((arr: any) => {
      html += '<tr>'
      arr.forEach((number: any) => {
        html += `<td>${number}</td>`
      })
      html += '</tr>'
    })

    body!.innerHTML = html

    document.getElementById("result-h5")!.innerHTML = h2
    this.triggerModal()
  }


  generateMatrixFromForm() {
    let branchMatrix = []
    let linkMatrix = []

    let branches = document.querySelectorAll(".branch input")
    let links = document.querySelectorAll(".link input")

    // Generate branch Arr
    let temp = this.branch_col_size
    let temp_arr = []
    for (let i = 0; i < branches.length; i++) {
      if (i % temp == 0 && i != 0) {
        branchMatrix.push(temp_arr)
        temp_arr = []
      }

      let value = parseInt((branches[i] as HTMLInputElement).value)

      if (isNaN(value)) {
        Swal.fire({
          icon: 'error',
          text: 'You should Enter All the Matrix Values as Numbers',
          confirmButtonText: 'Ok'
        })
      }

      temp_arr.push(value)
    }

    branchMatrix.push(temp_arr)

    // Generate Link Array
    temp = this.link_col_size
    temp_arr = []
    for (let i = 0; i < links.length; i++) {
      if (i % temp == 0 && i != 0) {
        linkMatrix.push(temp_arr)
        temp_arr = []
      }
      let value = parseInt((links[i] as HTMLInputElement).value)
      temp_arr.push(value)
    }
    linkMatrix.push(temp_arr)

    return {
      branchMatrix,
      linkMatrix
    }

  }

}
