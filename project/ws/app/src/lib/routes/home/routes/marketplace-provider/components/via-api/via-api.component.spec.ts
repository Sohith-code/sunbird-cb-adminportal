import { ViaApiComponent } from './via-api.component'
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { MarketplaceService } from '../../services/marketplace.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import * as _ from 'lodash'

describe('ViaApiComponent', () => {
  let component: ViaApiComponent
  let mockFormBuilder: FormBuilder
  let mockMarketplaceService: jest.Mocked<MarketplaceService>
  let mockSnackBar: jest.Mocked<MatSnackBar>
  let mockActivatedRoute: jest.Mocked<ActivatedRoute>

  // Helper function to create mock form groups
  // const createMockKeyValueFormGroup = (key = '', value = '') => {
  //   return new FormGroup({
  //     key: new FormControl(key, Validators.required),
  //     value: new FormControl(value)
  //   })
  // }

  // Helper function to create mock form array
  // const createMockFormArray = (items: Array<{ key: string, value: string }> = []) => {
  //   const formArray = new FormArray<FormGroup>([])
  //   items.forEach(item => {
  //     formArray.push(createMockKeyValueFormGroup(item.key, item.value))
  //   })

  //   // Always add an empty form group at the end
  //   formArray.push(createMockKeyValueFormGroup())

  //   return formArray
  // }

  // the params table child component always seeds an empty key/value row
  const addEmptyRow = (formArray: FormArray) => {
    formArray.push(new FormGroup({ key: new FormControl(''), value: new FormControl('') }))
  }

  beforeEach(() => {
    mockFormBuilder = new FormBuilder()

    mockMarketplaceService = {
      getConfiguraionDetails: jest.fn(),
      updateConfiguration: jest.fn(),
      createConfiguration: jest.fn(),
      updateProvider: jest.fn()
    } as any

    mockSnackBar = {
      open: jest.fn()
    } as any

    mockActivatedRoute = {
      data: {
        subscribe: jest.fn((callback) => {
          callback({
            pageData: {
              data: {}
            }
          })
        })
      }
    } as any

    // Create component with mocked dependencies
    component = new ViaApiComponent(
      mockFormBuilder,
      mockMarketplaceService,
      mockSnackBar,
      mockActivatedRoute
    )

    // Manually trigger initialization
    component.initializaTion()
  })

  describe('Initialization', () => {
    it('should initialize form groups correctly', () => {
      expect(component.servicesFormGroup).toBeDefined()
      expect(component.viaApiFormGroup).toBeDefined()
      expect(component.paramsFormGroup).toBeDefined()
      expect(component.headersFormGroup).toBeDefined()
      expect(component.bodyFormGroup).toBeDefined()
      expect(component.authenticationFormGroup).toBeDefined()
      expect(component.apiTypesList.length).toBe(2)
    })
  })

  describe('Form Array Manipulation', () => {
    it('should construct params form array correctly', () => {
      // Simulate URL with parameters
      component.displayUrl = 'http://example.com?param1=value1&param2=value2'

      // Trigger params form array construction
      component.constructParamsFormArray()

      // Check the form array: 2 params + 1 empty row
      const paramsFormArray = component.paramsFormArray
      expect(paramsFormArray.length).toBe(3)
      expect(paramsFormArray.value).toEqual(expect.arrayContaining([
        { key: 'param1', value: 'value1' },
        { key: 'param2', value: 'value2' },
        { key: '', value: '' },
      ]))
    })
  })

  describe('URL Construction', () => {
    it('should construct display URL correctly', () => {
      const paramsArray = [
        { key: 'param1', value: 'value1' },
        { key: 'param2', value: 'value2' }
      ]

      component.viaApiFormGroup.get('apiUrl')?.setValue('http://example.com')
      component.constructDisplayUrl(paramsArray)

      expect(component.displayUrl).toBe('http://example.com?param1=value1&param2=value2')
    })

    it('should parse URL parameters correctly', () => {
      component.displayUrl = 'http://example.com?param1=value1&param2=value2'
      const params = component.constructParams

      expect(params).toEqual([
        { key: 'param1', value: 'value1' },
        { key: 'param2', value: 'value2' },
        { key: '', value: '' }
      ])
    })
  })

  describe('Configuration Methods', () => {
    beforeEach(() => {
      component.providerDetails = {
        serviceRegistryDetails: {},
        data: { partnerCode: 'TEST' }
      }
      component.providerConfiguration = {}
    })

    it('should generate courses configuration correctly', () => {
      // Set values manually
      component.servicesFormGroup.patchValue({
        serviceName: 'Test Service',
        serviceCode: 'TEST',
        serviceDescription: 'Test Description',
        isAuthenticated: false,
        strictCache: false,
        strictCacheTimeInMinutes: null
      })

      component.viaApiFormGroup.patchValue({
        apiType: 'GET',
        apiUrl: 'http://example.com'
      })

      addEmptyRow(component.bodyFormGroup.controls.tableListFormArray as FormArray)
      addEmptyRow(component.headersFormGroup.controls.tableListFormArray as FormArray)
      addEmptyRow(component.paramsFormArray)

      const config = component.generatCoursesConfiguration()

      expect(config.serviceName).toBe('Test Service')
      expect(config.serviceCode).toBe('TEST')
      expect(config.requestMethod).toBe('GET')
      expect(config.url).toBe('http://example.com')
      expect(config.isFormData).toBe(false)
      expect(config.partnerCode).toBe('TEST')
    })
  })

  // Additional tests can be added here
})