'use strict'
const fs = require('fs');
const PDFDocument = require('./PdfKit');

module.exports = class ManifestPdf extends PDFDocument{
    
    constructor(manifest,shipments,options = {}){
        super(options)
        this.theManifest = manifest
        this.shipments = shipments
    }

    manifest(){
        this.header()
        this.moveDown()
        this.details()
        this.moveDown()
        
        let rows = []
        
        this.shipments.forEach(shipment =>{
            rows.push([shipment.trackingId,shipment.title,shipment.customerName,shipment.customerTelephone,shipment.CBM,shipment.amountPaid,shipment.totalCost,shipment.currency])
        })
        const table = {
            headers : ['Id','Name','Customer','Telephone','CBM','Paid','Cost','Currency'],
            rows:rows
        }

        this.table(table,{
            prepareHeader: () => this.font('Helvetica-Bold').fillColor('orange'),
            prepareRow: (row, i) => this.font('Helvetica').fontSize(11).fillColor('#1d1f25')
        })
        this.moveDown()
        this.description()

        
    }

    header(){

        this.moveTo(0,0)
        .lineTo(0,100)
        .quadraticCurveTo(this.page.width/5,55,this.page.width*0.75,0)
        .lineTo(0,0)
        .fill('orange')

        this.moveTo(this.page.width/4,50)
        .quadraticCurveTo(this.page.width*0.9,30,this.page.width,100)
        .lineTo(this.page.width,0)
        .lineTo(this.page.width*0.75,0)
        .lineTo(this.page.width/4,50)
        .fill('green')

        this.circle(this.page.width/3.8,40,60)
        .fill('whitesmoke')
        

        const theStart =this.page.margins.left
        const theEnd =this.page.width-this.page.margins.right 
        const theTop = this.page.margins.top
        const options = {
            align:'center',
            width:70,
            height:70,
        }
        this.image(`${appRoot}/images/logo.jpg`,this.page.width/3.8-40,5,options)
        
        this.font("Helvetica").fontSize(18).fillColor('orange')
        this.text('Manifest',theEnd-this.widthOfString('Manifest'),10,{
            width:this.widthOfString('Manifest'),
            align:'center',
            height:this.heightOfString('manifest'),
        })


        this.moveDown()
        this.moveDown()
        this.moveDown()
    }

    details(){
        this.font("Helvetica").fontSize(11.5).fillColor('#414652')
        const lines = [
            ['Carrier',this.theManifest.shipperName,'Tracking Id',this.theManifest.trackingId],
            ['Contact',this.theManifest.shipperContact,'Source',this.theManifest.source],
            ['Departure',new Date(this.theManifest.departure) == 'Invalid Date'?'':new Date(this.theManifest.departure).toUTCString(),'Destination',this.theManifest.destination],
            ['Arrival',new Date(this.theManifest.departure) == 'Invalid Date'?'':new Date(this.theManifest.arrival).toUTCString(),'Agent',this.theManifest.agentName],
            ['Created On',new Date(this.theManifest.departure) == 'Invalid Date'?'':new Date(this.theManifest.createdOn).toUTCString(),'Telephone',this.theManifest.agentTelephone]
        
        ]

        let usableWidth = (this.page.width- this.page.margins.left - this.page.margins.right)
        
        
        const computeLineHeight = (line)=>{
            let height = 0
            line.forEach(part =>{
               const itemHeight = this.heightOfString(part,{
                    width:this.itemWidth,
                    align:'left'
                })
                height = Math.max(itemHeight,height)
            })
                
            return height
        }


        const smSpace = 5
        const lgSpace = 10
        const lineSpace = 10
        const totalSpace = lgSpace
        usableWidth = usableWidth - totalSpace
        const itemWidth = usableWidth/4

       
        
        const startX = 0 + this.page.margins.left
        const startY = this.y
        const theEnd =this.page.width-this.page.margins.right 
       
        let currentTotalRowHeight = startY
        lines.forEach((line,i) =>{          
            const rowHeight =computeLineHeight(line)
            const y = currentTotalRowHeight
            this.fillColor('#eff5f7')
            this.moveTo(startX,y)
            .lineTo(startX+itemWidth+itemWidth,y)
            .lineWidth(0.5)
            .opacity(0.1)
            .stroke()
            .opacity(1)
            this.fillColor('#414652')
            this.text(line[0],startX,y+lineSpace,{
                width:itemWidth,
                height:rowHeight
            })
            this.text(line[1],startX+itemWidth,y+lineSpace,{
                width:itemWidth,
                height:rowHeight
            })
            this.fillColor('eff5f7')
            this.moveTo(startX+(itemWidth*2)+lgSpace,y)
            .lineTo(theEnd,y)
            .lineWidth(0.5)
            .opacity(0.1)
            .stroke()
            .opacity(1)
            this.fillColor('#414652')
            this.text(line[2],startX+(itemWidth*2)+lgSpace,y+lineSpace,{
                width:itemWidth,
                height:rowHeight
            })
            this.text(line[3],startX+(itemWidth*3)+totalSpace,y+lineSpace,{
                width:itemWidth,
                height:rowHeight
            })
            currentTotalRowHeight = currentTotalRowHeight+rowHeight+lineSpace     
        })
       
        this.moveDown()
       
    }

    description(){
        const description  = this.theManifest.description
        if(!description || description == '')
        {
            return
        }
        this.moveDown()
        const computeHeight = (description) =>{
            const titleHeight = this.heightOfString('Description')*2
            const descriptionHeight = this.heightOfString(description)
            return titleHeight + descriptionHeight
        }

        const bottom = this.page.height-this.page.margins.bottom
        const width = this.page.width -this.page.margins.left-this.page.margins.right -20
        if (this.y + computeHeight(description) > bottom)
        {
            this.addPage();
        }
        this.fillColor('orange')
        .fontSize(16)
        this.text('Description',this.x,this.y,{
            align:'center'
        })
        this.moveDown()
        .fontSize(13)
        .fillColor('#019371')
        this.text(description,this.x,this.y,{
            align:'justify',
            width: width,
            lineSpace:3
        })
    }
    
}


