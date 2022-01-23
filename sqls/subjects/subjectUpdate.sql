IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'subjectUpdate')
	BEGIN
  DROP  Procedure  subjectUpdate
END
GO

CREATE PROCEDURE [dbo].subjectUpdate(
  @id					  INT,
  @firstName		NVARCHAR(100),
  @middleName		NVARCHAR(100),
  @lastName			NVARCHAR(100),
  @dob          DATE,
  @sirutaId     INT,
  @notes varchar(MAX) = ''
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE	[dbo].[Subject]
	SET	firstName = @firstName,
      middleName = @middleName,
			lastName = @lastName,
			dob = @dob,
      sirutaID = @sirutaId,
      notes = @notes,
			updated = GETDATE()
	WHERE	id = @id

  IF @@ERROR <> 0
  BEGIN
    RETURN -1
  END
END
GO
GRANT EXEC ON [dbo].subjectUpdate TO rpb_role
GO