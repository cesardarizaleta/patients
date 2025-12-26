import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { PatientForm } from './patient-form';
import { PatientService } from '../../services/patient';
import { ModalService } from '../../services/modal';
import { ToastService } from '../../services/toast';

describe('PatientForm', () => {
  let component: PatientForm;
  let fixture: ComponentFixture<PatientForm>;
  let mockPatientService: jasmine.SpyObj<PatientService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const patientServiceSpy = jasmine.createSpyObj('PatientService', [
      'createPatient',
      'updatePatient'
    ]);
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['close']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [PatientForm],
      providers: [
        FormBuilder,
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientForm);
    component = fixture.componentInstance;
    mockPatientService = TestBed.inject(PatientService) as jasmine.SpyObj<PatientService>;
    mockModalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    mockToastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
