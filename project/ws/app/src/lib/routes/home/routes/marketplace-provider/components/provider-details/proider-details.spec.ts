import { ProviderDetailsComponent } from './provider-details.component'
import { FormBuilder } from '@angular/forms'
import { Router } from '@angular/router'
import { MarketplaceService } from '../../services/marketplace.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { LoaderService } from '../../../../services/loader.service'
import { DatePipe } from '@angular/common'
import { of, throwError } from 'rxjs'

describe('ProviderDetailsComponent', () => {
  let component: ProviderDetailsComponent
  let mockMarketplaceService: any
  let mockSnackBar: any
  let mockLoaderService: any
  let mockRouter: any

  const fillValidForm = () => {
    component.providerFormGroup.patchValue({
      contentPartnerName: 'Test Partner',
      partnerCode: '123456',
      websiteUrl: 'http://test.com',
      description: 'Test description',
    })
    component.addTips('Tip 1')
    component.imageUrl = 'http://image.com'
  }

  beforeEach(() => {
    mockMarketplaceService = {
      createProvider: jest.fn(),
      updateProvider: jest.fn(),
      uploadThumbNail: jest.fn(),
      uploadCIOSContract: jest.fn(),
    }
    mockSnackBar = { open: jest.fn() }
    mockLoaderService = { changeLoad: { next: jest.fn() } }
    mockRouter = { navigate: jest.fn(), navigateByUrl: jest.fn() }

    component = new ProviderDetailsComponent(
      new FormBuilder(),
      mockRouter as Router,
      mockMarketplaceService as MarketplaceService,
      mockSnackBar as MatSnackBar,
      new DatePipe('en-US'),
      mockLoaderService as LoaderService
    )
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize the form on init', () => {
    component.ngOnInit()
    expect(component.providerFormGroup).toBeTruthy()
  })

  it('should patch provider details on changes', () => {
    const providerDetails = {
      data: {
        contentPartnerName: 'Test Partner',
        partnerCode: '123456',
        websiteUrl: 'http://test.com',
        description: 'Test description',
        link: 'http://image.com',
        providerTips: ['Tip 1', 'Tip 2']
      }
    }
    component.ngOnChanges({
      providerDetails: {
        currentValue: providerDetails,
        previousValue: null,
        firstChange: true,
        isFirstChange: jest.fn()
      }
    })

    const rawValue = component.providerFormGroup.getRawValue()
    expect(rawValue.contentPartnerName).toBe('Test Partner')
    // partner code is disabled once patched, so it is only part of the raw value
    expect(component.providerFormGroup.controls.partnerCode.disabled).toBe(true)
    expect(rawValue.partnerCode).toBe('123456')
    expect(rawValue.websiteUrl).toBe('http://test.com')
    expect(rawValue.description).toBe('Test description')
    expect(rawValue.providerTips).toEqual(['Tip 1', 'Tip 2'])
    expect(component.imageUrl).toBe('http://image.com')
  })

  it('should handle valid form submission for new provider', () => {
    jest.useFakeTimers()
    fillValidForm()
    mockMarketplaceService.createProvider.mockReturnValue(of({ result: { id: 'p1' } }))

    component.saveProviderDetails()

    expect(mockMarketplaceService.createProvider).toHaveBeenCalledWith(expect.objectContaining({
      contentPartnerName: 'Test Partner',
      partnerCode: '123456',
      providerTips: ['Tip 1'],
    }))
    expect(mockLoaderService.changeLoad.next).toHaveBeenCalledWith(false)
    jest.advanceTimersByTime(1000)
    expect(mockSnackBar.open).toHaveBeenCalledWith('Successfully Onboarded')
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/marketplace-providers/onboard-partner/p1'])
  })

  it('should show an error message when service fails', () => {
    fillValidForm()
    mockMarketplaceService.createProvider.mockReturnValue(throwError({
      error: { params: { errMsg: 'Something went wrong' } },
      status: 500,
    }))

    component.saveProviderDetails()

    expect(mockLoaderService.changeLoad.next).toHaveBeenCalledWith(false)
    expect(mockSnackBar.open).toHaveBeenCalledWith('Something went wrong')
  })

  it('should show snack bar for invalid form submission', () => {
    component.providerFormGroup.patchValue({
      contentPartnerName: '',
      partnerCode: '',
      websiteUrl: '',
      description: '',
    })
    const uploadSpy = jest.spyOn(component, 'createContentsToUpload')

    component.submit()
    expect(uploadSpy).not.toHaveBeenCalled()
    expect(component.logoTouched).toBe(true)

    component.saveProviderDetails()
    expect(mockSnackBar.open).toHaveBeenCalledWith('Please fill all the mandator fields with proper data')
  })

  it('should navigate to provider dashboard', () => {
    component.navigateToProvidersDashboard()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/home/marketplace-providers')
  })

  it('should handle thumbnail file selection', () => {
    const file = new File([new Uint8Array(500000)], 'image.png', { type: 'image/png' })
    const readSpy = jest.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(() => undefined)

    component.onThumbNailSelected(file)

    expect(component.logoTouched).toBe(true)
    expect(component.thumbnailFile).toBe(file)
    expect(readSpy).toHaveBeenCalledWith(file)
    expect(mockSnackBar.open).not.toHaveBeenCalled()
    readSpy.mockRestore()
  })

  it('should show error snack bar if thumbnail size is out of range', () => {
    const file = new File(['small'], 'image.png', { type: 'image/png' })
    component.onThumbNailSelected(file)
    expect(mockSnackBar.open).toHaveBeenCalledWith('Please upload image sized between 10 KB and 2 MB')
  })

  it('should show error snack bar if invalid file type is uploaded for thumbnail', () => {
    const event = { name: 'image.jpg', size: 500000, type: 'image/jpg' }
    component.onThumbNailSelected(event)
    expect(mockSnackBar.open).toHaveBeenCalledWith('Please upload svg or png image')
  })

  it('should handle file upload for PDF', () => {
    const file = new File([''], 'file.pdf', { type: 'application/pdf' })
    component.onDrop(file)

    expect(component.pdfUploaded).toBeTruthy()
    expect(component.fileName).toBe('file.pdf')
  })

  it('should show error snack bar for non PDF file', () => {
    const file = new File([''], 'file.txt', { type: 'text/plain' })
    component.onDrop(file)
    expect(mockSnackBar.open).toHaveBeenCalledWith('Please upload PDF file')
  })

  it('should show error snack bar for invalid PDF file size', () => {
    const largeFile = new File([''], 'large-file.pdf', { type: 'application/pdf' })
    Object.defineProperty(largeFile, 'size', { value: 200 * 1024 * 1024, configurable: true })

    component.onDrop(largeFile)

    expect(mockSnackBar.open).toHaveBeenCalledWith('file size should not be more than 100 MB')
    expect(component.pdfUploaded).toBe(false)
  })
})
