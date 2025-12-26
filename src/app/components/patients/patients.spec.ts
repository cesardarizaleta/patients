import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { Patients } from './patients';
import { PatientService } from '../../services/patient';

describe('Patients', () => {
  let component: Patients;
  let fixture: ComponentFixture<Patients>;
  let mockPatientService: jasmine.SpyObj<PatientService>;

  beforeEach(async () => {
    const patientServiceSpy = jasmine.createSpyObj('PatientService', [
      'getAllPatients'
    ], {
      patients: signal([])
    });

    await TestBed.configureTestingModule({
      imports: [Patients],
      providers: [
        { provide: PatientService, useValue: patientServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Patients);
    component = fixture.componentInstance;
    mockPatientService = TestBed.inject(PatientService) as jasmine.SpyObj<PatientService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
