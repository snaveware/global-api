'use strict';

const PDFDocument = require('pdfkit');

class PDFDocumentWithTables extends PDFDocument {
    constructor (options) {
        super(options);
    }

    table (table, arg0, arg1, arg2) {
        let startX = this.page.margins.left, startY = this.y;
        let options = {};

        if ((typeof arg0 === 'number') && (typeof arg1 === 'number')) {
            startX = arg0;
            startY = arg1;

            if (typeof arg2 === 'object')
                options = arg2;
        } else if (typeof arg0 === 'object') {
            options = arg0;
        }

        const columnCount = table.headers.length;
        const rowCount = table.rows.length
        const columnSpacing = options.columnSpacing || 5;
        const rowSpacing = options.rowSpacing || 5;
        const usableWidth = options.width || (this.page.width - this.page.margins.left - this.page.margins.right);

        const prepareHeader = options.prepareHeader || (() => {});
        const prepareRow = options.prepareRow || (() => {});
        const computeRowHeight = (row) => {
            let result = 0;

            row.forEach((cell) => {
                const cellHeight = this.heightOfString(cell, {
                    width: columnWidth,
                    align: 'left'
                });
                result = Math.max(result, cellHeight);
            });

            return result + rowSpacing;
        };
        let columnCharCounts = []
        let totalColumnWidth = 0
       
        for (let i = 0; i < columnCount; i++) {
            let largestCharacterCount = 0
            for (let j = 0; j < rowCount; j++) {       
                let cellString = `${table.rows[j][i]}`
                let thisColumnCharWidth = cellString.length
                if(thisColumnCharWidth >20){
                    thisColumnCharWidth = 20
                }else if(thisColumnCharWidth <5){
                    thisColumnCharWidth = 5
                }
                largestCharacterCount = Math.max(thisColumnCharWidth,largestCharacterCount)
            
            }
            const headerString = `${table.headers[i]}`
            const headerCount = headerString.length
            largestCharacterCount = Math.max(headerCount,largestCharacterCount)
            totalColumnWidth = totalColumnWidth+largestCharacterCount
            columnCharCounts.push(largestCharacterCount)  
            largestCharacterCount = 0        
        }
       
        let unitWidth = usableWidth/totalColumnWidth
        
        const spacing = columnSpacing*columnCount
        const columnContainerWidth = usableWidth / columnCount+spacing;
        const columnWidth = columnContainerWidth - columnSpacing;
        const maxY = this.page.height - this.page.margins.bottom;

        let rowBottomY = 0;

        this.on('pageAdded', () => {
            startY = this.page.margins.top;
            rowBottomY = 0;
        });

        // Allow the user to override style for headers
        prepareHeader();

        // Check to have enough room for header and first rows
        if (startY + 3 * computeRowHeight(table.headers) > maxY)
            this.addPage();

        // Print all headers
        let columnWidthBefore = 0
        
        table.headers.forEach((header, i) => {           
            const thisColumnWidth = columnCharCounts[i]*unitWidth
           
            this.text(header, startX + columnWidthBefore , startY, {
                width: thisColumnWidth-columnSpacing,
                align: 'left'
            });
            columnWidthBefore = columnWidthBefore+thisColumnWidth
        });

        // Refresh the y coordinate of the bottom of the headers row
        rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY);

        // Separation line between headers and rows
        this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
            .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
            .lineWidth(2)
            .stroke()
        
        table.rows.forEach((row, i) => {
            const rowHeight = computeRowHeight(row);

            // Switch to next page if we cannot go any further because the space is over.
            // For safety, consider 3 rows margin instead of just one
            if (startY+rowHeight < maxY)
                startY = rowBottomY + rowSpacing;
            else
                this.addPage();

            // Allow the user to override style for rows
            prepareRow(row, i);

            // Print all cells of the current row
            let previousWidth = 0
            row.forEach((cell, i) => {
                const thisWidth = columnCharCounts[i]*unitWidth
                this.text(cell, startX +previousWidth , startY, {
                    width: thisWidth-columnSpacing,
                    align: 'left',
                });
                previousWidth = previousWidth+thisWidth
            });

            // Refresh the y coordinate of the bottom of this row
            rowBottomY = Math.max(startY + rowHeight, rowBottomY);

            // Separation line between rows
            this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
                .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
                .lineWidth(1)
                .opacity(0.7)
                .strokeColor('orange')
                .stroke()
                .opacity(1); // Reset opacity after drawing the line
        });

        this.x = startX;
        this.moveDown();

        return this;
    }

}

module.exports = PDFDocumentWithTables;