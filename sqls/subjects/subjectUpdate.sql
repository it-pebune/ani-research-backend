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
  @lastName			NVARCHAR(100),
  @dob          DATE,
  @sirutaId     INT,
  @notes        VARCHAR(MAX) = '',
  @photoUrl     VARCHAR(MAX) = ''
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE	[dbo].[Subject]
	SET	firstName = @firstName,
  		lastName = @lastName,
			dob = @dob,
      sirutaID = @sirutaId,
      photoUrl = @photoUrl,
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