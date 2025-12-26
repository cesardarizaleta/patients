import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { PatientList } from './patient-list';
import { PatientService } from '../../services/patient';
import { ModalService } from '../../services/modal';

describe('PatientList', () => {
  let component: PatientList;
  let fixture: ComponentFixture<PatientList>;
  let mockPatientService: jasmine.SpyObj<PatientService>;
  let mockModalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    const patientServiceSpy = jasmine.createSpyObj('PatientService', [
      'getAllPatients',
      'deletePatient'
    ], {
      patients: signal([])
    });
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['open']);

    await TestBed.configureTestingModule({
      imports: [PatientList],
      providers: [
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientList);
    component = fixture.componentInstance;
    mockPatientService = TestBed.inject(PatientService) as jasmine.SpyObj<PatientService>;
    mockModalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
